frappe.pages['customer-details'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Customer Details',
		single_column: true
	});
	$("<div class='new-btn'>\
		<button class='new-btn1 btn-sm2' style='width:55px;'><b>New</b></button>\
		</div>\
		<div class='cust-info' \
		style='min-height: 200px; padding:15px;'></div>").appendTo(page.main);
	wrapper.customer_details = new frappe.CustomerDetails(wrapper);
}

frappe.CustomerDetails = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".cust-info");
		this.filters();
		this.cust_list();
		this.new_cust();
	},

	filters: function(){
		$search = $("<button class='search-btn btn-sm3'><b>Search</b></button>").appendTo($('.page-form'));
		var me = this;
		me.customer_name = me.wrapper.page.add_field({
			fieldname: "customer_name",
			label: __("Customer Name"),
			fieldtype: "Link",
			options: "Customer"
		});
		me.customer_type = me.wrapper.page.add_field({
			fieldname: "customer_type",
			label: __("Customer Type"),
			fieldtype: "Select",
			options:[" ","Individual", "Company"]
		});
		me.territory = me.wrapper.page.add_field({
			fieldname: "territory",
			label: __("Territory"),
			fieldtype: "Link",
			options: "Territory"
		});

		$(".search-btn").on("click", function() {
			var cust_flt = me.customer_name.$input.val();
			var cust_type = me.customer_type.$input.val();
			var cust_territory = me.territory.$input.val();
			var filters = {};
			filters = {
				"cust_flt": cust_flt,
				"cust_type": cust_type,
				"cust_territory": cust_territory
			}
			me.cust_list(filters);
		});
	},

	cust_list: function(filters) {
		var me = this;
		$('.cust-info').empty()
		frappe.call({
			method:"erpnext.selling.page.customer_details.customer_details.get_customer",
			args:{
					"filters":filters
				},
			callback: function(r) {
				me.cust_table(r.message);
			}
		});		  
	},

	cust_table: function(r){
		this.table = $("<table class='test-table' width='100%' border='1'>\
			<thead><tr></tr></thead>\
			<tbody></tbody>\
			</table>").appendTo(this.body);
		var me = this;
		row = ''
		row = r
		$.each(row, function( index, value ) {
			var rows = $("<tr>").appendTo(me.table.find("tbody"));
			$td = $("<td class='cust-row' width='65%'>").html('<a class="fold" data-flag=true>'+value[0]+'</a>')
				.appendTo(rows);
			$("<td width='35%'>").html("<button class='btn1 btn-sm1 btn1-default' id='"+value[0]+"'><b>Show Contacts<b/>\
				</button>").appendTo(rows);
			$(repl('<div class="customer-dtls hide" style="padding:15px;background-color: #EEEEEE;">\
				Customer Name : %(Customer_Name)s<br>Customer Type : %(Customer_Type)s<br>Lead Name : %(Lead_Name)s<br>\
				Territory : %(Territory)s<br>Default Sales Partner : %(Default_Sales_Partner)s<br>Default Comission Rate: \
				%(Default_Comission_Rate)s</div>',{Customer_Name: value[1],Customer_Type: value[2],Lead_Name: value[3],
				Territory: value[4],Default_Sales_Partner: value[5],Default_Comission_Rate: value[6]})).appendTo($td)
		});

		$(".fold").on("click", function() {
			$('.customer-dtls').addClass("hide");
			if($(this).attr("data-flag")==='true'){
				$('.fold').attr("data-flag",true);
				$(this).parent().find('.customer-dtls').removeClass("hide");
				$(this).attr("data-flag", false);
			}
			else{
				$(this).parent().find('.customer-dtls').addClass("hide");
				$(this).attr("data-flag", true);
			}
		});
		me.set_event();
	},

	set_event: function(){
		var me = this;
		$('.btn1').click(function(){
			me.show_contacts($(this).attr('id'));
		});
	},

	show_contacts: function(value){
		var me = this;
		frappe.call({
			method:"erpnext.selling.page.customer_details.customer_details.get_contact",
			args:{
				"value": value
			},
			callback: function(r) {
				me.contact_pop_up(r)
			}
		});	
	},

	contact_pop_up: function(r){
		var me = this;
		this.d = new frappe.ui.Dialog({
			title: __("Customer Contacts")
		});
		if (r.message) {
			$.each(r.message, function( i, val ) {
				$(repl('<div class="cont-dtls" style="padding:15px; background-color: #E6E6E6;"> First Name : %(First_Name)s<br>Last Name : \
					%(Last_Name)s<br> Customer Name : %(Customer_Name)s<br>Email ID : %(Email_ID)s<br>\
					Phone No : %(Phone_No)s</div>',{First_Name: val[0],
				Last_Name: val[1],Customer_Name: val[2],Email_ID: val[3],Phone_No: val[4]})).appendTo($('.modal-body'))
			});
		}
		else{
			$("<div>\
			Sorry..No contact found...!\
			</div>").appendTo($('.modal-body'))
		}
		this.d.show();
	},

	new_cust:function(){
		var me = this;
		$('.new-btn1').click(function(){
			$('.modal-body').empty()
			me.set_new_customer_dialog()
		});
	},

	set_new_customer_dialog:function(){
		var me = this;
		var dia = new frappe.ui.Dialog({
			title: __("New Customer"),
			width:  1200,
			fields: [			
				{label:__("Full Name"), fieldtype:"Data", reqd: 1, fieldname:"customer_name"},
				{label:__("Type"), fieldtype:"Select", options:["Individual", "Company"], reqd: 1, fieldname:"customer_type"},
				{label:__("From Lead"), fieldtype:"Link", options:"Lead", fieldname:"lead_name"},
				{fieldtype: "Column Break"},
				{label:__("Customer Group"), fieldtype:"Link", options:"Customer Group", reqd: 1, fieldname:"customer_group"},
				{label:__("Territory"), fieldtype:"Link", options:"Territory", reqd: 1, fieldname:"territory"},
				{fieldtype: "Section Break"},
				{label:__("Customer Details"), fieldtype:"Small Text", fieldname:"customer_details"},
				{label:__("Currency"), fieldtype:"Link", options:"Currency", fieldname:"default_currency"},
				{label:__("Price List"), fieldtype:"Link", options:"Price List", fieldname:"default_price_list"},
				{fieldtype: "Column Break"},
				{label:__("Taxes and Charges"), fieldtype:"Link", options:"Sales Taxes and Charges Template", fieldname:"default_taxes_and_charges"},
				{label:__("Credit days based On"), fieldtype:"Select", options:["Fixed Days","Last Day of the Next Month"], fieldname:"credit_days_based_on"},
				{label:__("Credit Limit"), fieldtype:"Currency", options:"Credit Limit", fieldname:"credit_limit"},
				{label:__("Website"), fieldtype:"Data", options:"Website", fieldname:"website"},
				{fieldtype: "Section Break"},
				{label:__("Save"), fieldtype:"Button", fieldname:"save_cust"}
			]
		});
		
		dia.show();
		
		$(dia.fields_dict.save_cust.input).click(function() {
			var v = {};
			v = dia.get_values();
			frappe.call({
				method: "erpnext.selling.page.customer_details.customer_details.create_cust",
				args: { 
					"values" : v
				},
				callback: function(r) {
					dia.hide();
					me.cust_list();
				}
			});
		});
	},
})
