# Copyright (c) 2025, Dhruvi Soliya and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class RestaurantTable(Document):
    def validate(self):
        if self.status == "Free":
            self.db_set("empty_seat", 0)
            
