from __future__ import unicode_literals
import frappe
import frappe.defaults

@frappe.whitelist()
def get_customer():
	cust_list = frappe.db.sql("""select name,IFNULL(customer_name,'')as customer_name,IFNULL(customer_type,'')as customer_type,
		IFNULL(lead_name,'')as lead_name,IFNULL(territory,'')as territory,IFNULL(default_sales_partner,'')as default_sales_partner,
		IFNULL(default_commission_rate,'')as default_commission_rate from `tabCustomer`""",as_list=1)
	# frappe.errprint(cust_list)
	return cust_list

@frappe.whitelist()
def get_contact(value):
	contacts = frappe.db.sql("""select IFNULL(first_name,' ')as first_name, IFNULL(last_name,' ')as last_name,
		IFNULL(customer,' ')as customer, IFNULL(email_id,' ')as email_id, IFNULL(phone,' ')as phone from `tabContact` where 
		customer_name='%s'"""%(value),as_list=1)
	return contacts