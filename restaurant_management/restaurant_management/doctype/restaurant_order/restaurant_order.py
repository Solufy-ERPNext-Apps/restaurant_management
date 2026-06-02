# Copyright (c) 2025, Dhruvi Soliya and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from frappe.model.workflow import apply_workflow
from frappe.utils import flt, now_datetime

class RestaurantOrder(Document):
	def on_update(self):
		if (self.workflow_state == "Cooking" and self.items and all(i.status == "Ready" for i in self.items)):
			self.db_set("workflow_state", "Ready")
	
	def validate(self):
		if self.items:
			for row in self.items:
				if row.item:
					if row.rate:
						row.amount = row.qty*row.rate

	@frappe.whitelist()
	def make_sales_invoice(self):
		si = frappe.new_doc("Sales Invoice")
		si.customer = self.customer
		si.company = self.company
		si.due_date = frappe.utils.nowdate()
		si.custom_restaurant_order = self.name
		si.custom_reservation = self.current_reservation if self.current_reservation else None
		for row in self.items:
			si.append("items",{
				"item_code": row.item,
				"item_name": row.item,
				"qty": row.qty,
				"rate": row.rate,
				"amount": row.amount,
				"description": row.kitchen_note
			})
		return si.as_dict()
@frappe.whitelist()
def get_kitchen_orders():
    result = []

    orders = frappe.get_all(
        "Restaurant Order",
        filters={"workflow_state": ["in", ["Open", "Cooking"]]},
        fields=["name", "table","creation","owner"]
    )

    for o in orders:
        doc = frappe.get_doc("Restaurant Order", o.name)

        for d in doc.items:
            if d.status in ("Open", "In Process"):
                result.append({
                    "order": o.name,
                    "table": o.table,
                    "creation": o.creation,
                    "owner": o.owner,  
                    "row_name": d.name,
                    "item": d.item,
                    "item_name": frappe.db.get_value("Item", d.item, "item_name"),
                    "qty": d.last_batch_qty,
                    "status": d.status,
                    "kitchen_note": d.kitchen_note
                })

    return result
@frappe.whitelist()
def update_item_status(row_name: str, status: str):
    row = frappe.get_doc("Restaurant Order Item", row_name)
    row.status = status
    row.sent_qty = row.qty
    row.save(ignore_permissions=True)

    order = frappe.get_doc("Restaurant Order", row.parent)

    if any(d.status == "In Process" for d in order.items):
        order.workflow_state = "Cooking"
    elif all(d.status == "Complete" for d in order.items):
        order.workflow_state = "Ready"

    order.save(ignore_permissions=True)
    return "OK"


@frappe.whitelist()
def mark_order_ready(row_name: str):
    row = frappe.get_doc("Restaurant Order Item", row_name)

    row.status = "Complete"
    row.sent_qty = row.qty
    # row.last_batch_qty = 0
    row.is_new_item = 0
    row.save(ignore_permissions=True)

    order = frappe.get_doc("Restaurant Order", row.parent)
    if not any(d.is_new_item == 1 for d in order.items):
        order.workflow_state = "Ready"
        order.save(ignore_permissions=True)

    return "OK"
@frappe.whitelist()
def get_waiter_orders():
    orders = frappe.get_all(
        "Restaurant Order",
        filters={"workflow_state": ["in", ["Cooking", "Ready"]]},
        fields=["name", "table", "creation", "owner"]
    )

    final_orders = []

    for o in orders:
        doc = frappe.get_doc("Restaurant Order", o.name)
        items = []

        for d in doc.items:
            if d.status == "Complete":
                items.append({
                    "row_name": d.name,
                    "item": d.item,
                    "qty": d.last_batch_qty,
                    "item_name": frappe.db.get_value("Item", d.item, "item_name")
                })

        if items:
            o["items"] = items
            final_orders.append(o)

    return final_orders
@frappe.whitelist()
def mark_item_served(row_name: str):
    item = frappe.get_doc("Restaurant Order Item", row_name)
    item.status = "Served"
    item.save(ignore_permissions=True)

    parent = frappe.get_doc("Restaurant Order", item.parent)

    # Agar sab items Served ho gaye
    if all(d.status == "Served" for d in parent.items):
        parent.workflow_state = "Served"
        parent.save(ignore_permissions=True)

    return "OK"

@frappe.whitelist()
def get_table_amount(table: str):
    from frappe.utils import flt
    table_doc = frappe.get_doc("Restaurant Table", table)
    if not table_doc.current_order:
        return {
            "amount": 0,
            "currency_symbol": "",
            "status": "Free"
        }
    order = frappe.get_doc("Restaurant Order", table_doc.current_order)
    if order.workflow_state in ("Closed", "Completed"):
        return {
            "amount": 0,
            "currency_symbol": ""
        }
    total = sum(flt(i.amount) for i in order.items)
    currency = frappe.db.get_value(
        "Company",
        order.company,
        "default_currency"
    )

    currency_symbol = frappe.db.get_value(
        "Currency",
        currency,
        "symbol"
    )

    return {
        "amount": total,
        "currency_symbol": currency_symbol or ""
    }
