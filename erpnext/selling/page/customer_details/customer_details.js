frappe.pages['customer-details'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Customer Details',
		single_column: true
	});
	$("<div class='cust-info' \
		style='min-height: 200px; padding:15px;'></div>").appendTo(page.main);
	wrapper.customer_details = new frappe.CustomerDetails(wrapper);
}

frappe.CustomerDetails = Class.extend({
	init: function(wrapper) {
		this.wrapper = wrapper;
		this.body = $(this.wrapper).find(".cust-info");
		this.cust_list();
	},
	
	cust_list: function() {
		var me = this;
		frappe.call({
			method:"erpnext.selling.page.customer_details.customer_details.get_customer",
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
				$(this).attr("data-flag", false)
			}
			else{
				$(this).parent().find('.customer-dtls').addClass("hide");
				$(this).attr("data-flag", true)
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
		var d = new frappe.ui.Dialog({
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
		d.show();
	},
})