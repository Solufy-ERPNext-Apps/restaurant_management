import frappe
import json
from frappe.apps import _
from frappe.model.workflow import apply_workflow
from frappe.utils import getdate, now_datetime, nowdate
from frappe.utils import flt
import frappe
import json
from frappe.model.workflow import apply_workflow
from frappe.utils import now_datetime

@frappe.whitelist()
def get_customer_visit_stats(customer: str):
    if not customer:
        return {
            "monthly_visits": 0,
            "lifetime_visits": 0,
            "type": "New"
        }

    from frappe.utils import getdate, nowdate

    today = getdate(nowdate())
    first_day = today.replace(day=1)

    monthly_visits = frappe.db.count(
        "Sales Invoice",
        filters={
            "customer": customer,
            "docstatus": 1,
            "outstanding_amount": 0,
            "posting_date": ["between", [first_day, today]]
        }
    )

    lifetime_visits = frappe.db.count(
        "Sales Invoice",
        filters={
            "customer": customer,
            "docstatus": 1,
            "outstanding_amount": 0,
            "status": 'Paid'
        }
    )

    if lifetime_visits >= 50:
        cust_type = "Platinum"
    elif lifetime_visits >= 20:
        cust_type = "VIP"
    elif lifetime_visits >= 10:
        cust_type = "Regular"
    elif lifetime_visits >= 1:
        cust_type = "Returning"
    else:
        cust_type = "New"

    return {
        "monthly_visits": monthly_visits,
        "lifetime_visits": lifetime_visits,
        "type": cust_type
    }
#nosemgrep
@frappe.whitelist(allow_guest=True)
def create_customer(name: str):
    if not name:
        frappe.throw(_("Customer name is required"))

    existing = frappe.get_all("Customer", filters={"customer_name": name}, limit_page_length=1)
    if existing:
        return existing[0].name

    doc = frappe.get_doc({
        "doctype": "Customer",
        "customer_name": name
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return doc.name
@frappe.whitelist(allow_guest=True)# nosemgrep
def create_order(table, customer=None, items=None, company=None, branch=None):
    if isinstance(items, str):
        items = json.loads(items)

    if not items:
        frappe.throw(_("No items received"))

    tab = frappe.get_doc("Restaurant Table", table)
    reservation = frappe.db.sql("""
        SELECT r.name
        FROM `tabReservation` r
        INNER JOIN `tabTable Details` ti
            ON ti.parent = r.name
        WHERE ti.table = %s
        AND r.workflow_state = 'Checked-In'
        ORDER BY r.datetime DESC
        LIMIT 1
    """, table, as_dict=True)


    reservation_id = reservation[0].name if reservation else None
    customer = frappe.get_value("Customer", customer) if customer else None
    company = frappe.defaults.get_user_default("company")
    currency = frappe.db.get_value("Company", company, "default_currency")
    if tab.current_order:
        order = frappe.get_doc("Restaurant Order", tab.current_order)
        if order.workflow_state == "Ready":
            order.workflow_state = "Open"
        if reservation_id and not order.current_reservation:
            order.current_reservation = reservation_id

    else:
        order = frappe.new_doc("Restaurant Order")
        order.table = table
        order.company = company
        order.currency = currency
        order.restaurant_branch = branch
        order.customer = customer
        order.order_type = "Dine-In"
        order.workflow_state = "Open"
        order.current_reservation = reservation_id


    for i in items:
        item_code = i.get("item")
        qty = int(i.get("qty", 1))
        sent = int(i.get("sent_qty", 0))
        kitchen_note = i.get("kitchen_note")
        existing = None
        for row in order.items:
            if row.item == item_code:
                existing = row
                break

        if existing:
            existing.qty += qty
            existing.last_batch_qty = qty - sent
            # existing.sent_qty += qty
            existing.is_new_item = 1
            existing.status = "Open"
            if kitchen_note:
                if existing.kitchen_note:
                    existing.kitchen_note += f"\n{kitchen_note}"
                else:
                    existing.kitchen_note = kitchen_note
            order.workflow_state = "Open"



            if existing.last_batch_qty > 0:
                existing.last_batch_qty = existing.qty - existing.sent_qty
        else:
            order.append("items", {
                "item": item_code,
                "qty": qty,
                "last_batch_qty": qty,
                "status": "Open",
                "is_new_item": 1,
                "kitchen_note": kitchen_note
            })
            order.workflow_state = "Open"

    if order.is_new():
        order.insert(ignore_permissions=True)
        frappe.db.set_value(
            "Restaurant Table",
            table,
            {
                "status": "Occupied",
                "current_order": order.name
            }
        )
    else:
        order.save(ignore_permissions=True)

    return {
        "order": order.name,
        "reservation": reservation_id
    }

@frappe.whitelist()
def finalize_bill(
    table: str,
    discount: float = 0,
    extra_charge: float = 0,
    payment_mode: str = "Cash",
    company: str | None = None
):
    try:
        from frappe.utils import flt, nowdate
        tab = frappe.get_doc("Restaurant Table", table)
        tab.reload()

        if not tab.current_order:
            frappe.throw(_("There is no active order for this table."))

        order = frappe.get_doc("Restaurant Order", tab.current_order)

        if not company:
            company = order.company or frappe.defaults.get_default("company")

        discount_pct = flt(discount)
        extra_charge = flt(extra_charge)
        currency = frappe.db.get_value("Company", company, "default_currency")

        si = frappe.new_doc("Sales Invoice")
        si.company = company
        si.currency = currency
        si.customer = order.customer
        si.custom_reservation = order.current_reservation
        si.custom_restaurant_order = order.name
        si.posting_date = nowdate()
        si.due_date = nowdate()
        si.update_stock = 0
        for item in order.items:
            si.append("items", {
                "item_code": item.item,
                "qty": item.qty,
                "rate": item.rate
            })
        if discount_pct:
            si.apply_discount_on = "Net Total"
            si.additional_discount_percentage = discount_pct
        if extra_charge > 0:
            si.append("taxes", {
                "charge_type": "Actual",
                "account_head": frappe.db.get_value("Account",{"company":si.company,"account_type":"Chargeable"},"name"),
                "description": "Extra Time Charge",
                "tax_amount": extra_charge
            })
        si.calculate_taxes_and_totals()
        si.insert(ignore_permissions=True)

        frappe.db.set_value("Restaurant Order",order.name,"workflow_state","Closed")
        frappe.db.set_value("Restaurant Table",table,{"status": "Free","current_order": ""})

        if si.custom_reservation:
            frappe.db.set_value("Reservation",si.custom_reservation,"workflow_state","Check-Out")

        return {
            "invoice_id": si.name,
            "grand_total": si.grand_total,
            "total_advance": si.total_advance,
            "outstanding_amount": si.outstanding_amount
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Finalize Bill Error")
        frappe.throw(str(e))


@frappe.whitelist()
def get_current_order(table: str):
    tab = frappe.get_doc("Restaurant Table", table)

    if not tab.current_order:
        return None

    order = frappe.get_doc("Restaurant Order", tab.current_order)

    return {
        "order": order.name,
        "company": order.company,
        "restaurant_branch": order.restaurant_branch,
        "customer": order.customer,
        "current_reservation": order.current_reservation,
        "items": [
            {
                "item": d.item,
                "item_name": frappe.db.get_value("Item", d.item, "item_name"),
                "qty": d.qty,
                "rate": d.rate,
                "kitchen_note": d.kitchen_note
            }
            for d in order.items
        ]
    }
