from __future__ import unicode_literals
import frappe
import frappe.defaults
import json

@frappe.whitelist()
def get_customer(filters=None):
	cust_list = frappe.db.sql("""select name,IFNULL(customer_name,'')as customer_name,IFNULL(customer_type,'')as 
		customer_type, IFNULL(lead_name,'')as lead_name,IFNULL(territory,'')as territory,IFNULL(default_sales_partner,'')as 
		default_sales_partner, IFNULL(default_commission_rate,'')as default_commission_rate from `tabCustomer` %s"""
		%(condition(filters) if filters else '') ,as_list=1)
	return cust_list

@frappe.whitelist()
def get_contact(value):
	contacts = frappe.db.sql("""select IFNULL(first_name,' ')as first_name, IFNULL(last_name,' ')as last_name,
		IFNULL(customer,' ')as customer, IFNULL(email_id,' ')as email_id, IFNULL(phone,' ')as phone from `tabContact` where 
		customer_name='%s'"""%(value),as_list=1)
	return contacts

@frappe.whitelist()
def create_cust(values):
	values = json.loads(values)
	cust = frappe.new_doc("Customer")
	cust.customer_name = values['customer_name']
	cust.customer_type = values['customer_type']
	cust.lead_name = values.get('lead_name')
	cust.customer_group = values.get('customer_group')
	cust.territory = values.get('territory')
	cust.customer_details = values.get('customer_details')
	cust.default_currency = values.get('default_currency')
	cust.default_price_list = values.get('default_price_list')
	cust.default_taxes_and_charges = values.get('default_taxes_and_charges')
	cust.credit_days_based_on = values.get('credit_days_based_on')
	cust.credit_limit = values.get('credit_limit')
	cust.website = values.get('website')
	cust.insert()
	return cust.name

def condition(filters):
	filters = json.loads(filters)
	conditions = []
	if filters.get("cust_flt"):
		conditions.append("customer_name='%(cust_flt)s'"%filters)
	if filters.get("cust_type"):
		conditions.append("customer_type='%(cust_type)s'"%filters)
	if filters.get("cust_territory"):
		conditions.append("territory='%(cust_territory)s'"%filters)

	return " where "+" and ".join(conditions) if conditions else ""
		