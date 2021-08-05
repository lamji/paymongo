// Copyright (c) 2021, Jick Lampago and contributors
// For license information, please see license.txt
frappe.ui.form.on('Paymongo billing info', {
	refresh: function(frm,) {
			const payment_methods_url = 'https://api.paymongo.com/v1/payment_methods';
			const payment_intents_url = 'https://api.paymongo.com/v1/payment_intents';
			const card_options2 = {
				method: 'POST',
				headers: {
				  Accept: 'application/json',
				  'Content-Type': 'application/json',
				  Authorization: 'Basic c2tfdGVzdF91ajNkYW45U0h1aDZIZEF6REVNWFEzUlo6'
				},
				body: JSON.stringify({
				  data: {
					attributes: {
					  amount: 10000,
					  payment_method_allowed: ['card'],
					  payment_method_options: {card: {request_three_d_secure: 'any'}},
					  currency: 'PHP'
					}
				  }
				})
			  };
			  
			const cardOptions = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Basic cGtfdGVzdF84MnR6QndIMnd0b0tWYmtCTENENWptMXY6'
				},
				body: JSON.stringify({
					data: {
					attributes: {
						details: {
							card_number: frm.doc.debitcredit[0].card_number, 
							exp_month: frm.doc.debitcredit[0].expiration_month, 
							exp_year: frm.doc.debitcredit[0].expiration_year, 
							cvc: frm.doc.debitcredit[0].cvc.toString()
						},
						billing: {
						address: {
							line1: frm.doc.street,
							line2: frm.doc.barangay,
							city:  frm.doc.city,
							state: frm.doc.state,
							postal_code: frm.doc.zip_code,
							country: "PH" 
						},
						name: frm.doc.debitcredit[0].full_name_on_the_card,
						email: frm.doc.email,
						phone: frm.doc.phone
						},
						type: 'card' 
					}
					}
				})
			};
		
			fetch(payment_methods_url, cardOptions)
			.then(res => res.json())
			.then(json => {
				console.log(json)
				fetch(payment_intents_url, card_options2)
				.then(res => res.json())
				.then(json => console.log(json))
				.catch(err => console.error('error:' + err));
			})
			.catch(err => console.error('error:' + err));

			console.log(frm)
			
			//Button UI Design
			$("[data-fieldname='payment']").html("<h3>No Payment method selected</h3><p class='warning'>Please select one above</p>");
			$(".warning").css({"background": "rgba(76, 175, 80, 0.3)", "padding": "20px"})
			// Gcash burron modifcation
			$("[data-fieldname='confirm_selection']").css({"width": "60%","box-shadow": "none",}).addClass("Gcash_icon");
			$(".btn.btn-xs.btn-default.Gcash_icon").addClass("Gcash-icon")
			$(".Gcash-icon").prepend("<img id='theImg' src='https://lawrencedaet.com/wp-content/uploads/2020/05/globe-e1588439586232.png'/>");
			$("#theImg").css({"width": "13%","margin": "0 10px"});

			// debit/credit button modificaton
			$("[data-fieldname='debitcredit_payment']").css({"width": "60%","margin": "-33px 0 0 150px","box-shadow": "none",}).addClass("debitcredit_payment_icon");
			$(".btn.btn-xs.btn-default.debitcredit_payment_icon").addClass("debitcredit-icon");
			$(".debitcredit-icon").prepend("<img id='debitcredit-icon' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ10jZFPqSEsc6l_zzvt8v_tKGRlZxT8520w&usqp=CAU'/>");
			$("#debitcredit-icon").css({"width": "27%","margin": "0 10px","padding": "10px"});
			
			// GrabPay button modification
			$("[data-fieldname='grabpay_payment']").css({"width": "60%","margin": "-34px 0 0 300px","box-shadow": "none"}).addClass("grabpay_payment_icon");
			$(".btn.btn-xs.btn-default.grabpay_payment_icon").addClass("grabpay-icon");
			$(".grabpay-icon").prepend("<img id='grabpay-icon' src='https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Grab_Logo.svg/640px-Grab_Logo.svg.png'/>");
			$("#grabpay-icon").css({"width": "25%","margin": "0 10px","padding": "10px"});
	},
	setup: function(frm,) {	
		// class Function
		class Global_Class {
			constructor(value) {
			  this.value = value;
			}
			ShowHide() {
				if(this.value == "gcash"){
					$("[data-fieldname='payment']").hide();
					$("[data-fieldname='debitcredit']").hide();
					$("[data-fieldname='grabpay']").hide();
					$("[data-fieldname='gcash_payment']").show();
					// Active button background
			
					// enable mandatory on gcash childtable
					frm.set_df_property("gcash_payment", "reqd", 1);
					frm.set_df_property("debitcredit", "reqd", 0);
					frm.set_df_property("grabpay", "reqd", 0);
				}else if(this.value == "debitcredit"){
					$("[data-fieldname='payment']").hide();
					$("[data-fieldname='debitcredit']").show();
					$("[data-fieldname='grabpay']").hide();
					$("[data-fieldname='gcash_payment']").hide();
					// Active button background
			
					// enable mandatory on debitcredit childtable
					frm.set_df_property("gcash_payment", "reqd", 0);
					frm.set_df_property("debitcredit", "reqd", 1);
					frm.set_df_property("grabpay", "reqd", 0);
				}else if(this.value == "grabpay"){
					$("[data-fieldname='payment']").hide();
					$("[data-fieldname='debitcredit']").hide();
					$("[data-fieldname='grabpay']").show();
					$("[data-fieldname='gcash_payment']").hide();
					// Active button background
				
					// enable mandatory on grabpay childtable
					frm.set_df_property("gcash_payment", "reqd", 0);
					frm.set_df_property("debitcredit", "reqd", 0);
					frm.set_df_property("grabpay", "reqd", 1);
				}else if(this.value == "undefined"){
					//show form of a selected payment method
					$("[data-fieldname='debitcredit']").hide();
					$("[data-fieldname='grabpay']").hide();
					$("[data-fieldname='gcash_payment']").hide();
					$("[data-fieldname='payment']").show();
					// Active button background
					
				}
			}
		}
		let refresh = new Global_Class("undefined")
		refresh.ShowHide()
		// button function
		// Gcash payment button
		frm.cscript.confirm_selection = function(doc) {
			let gcash = new Global_Class("gcash");
		  	gcash.ShowHide();
		}
		// Debit/Credit paymnet button
		frm.cscript.debitcredit_payment = function(doc) {
			let debitcredit = new Global_Class("debitcredit");
			debitcredit.ShowHide();
		}
		// Grabpay payment button
		frm.cscript.grabpay_payment = function(doc) {
			let grabpay = new Global_Class("grabpay");
			grabpay.ShowHide();
		}
	},
	// validate if the required feild are meet
	validate: function(frm){
		if(frm.fields[7].df.reqd === 0 && frm.fields[8].df.reqd === 0 && frm.fields[9].df.reqd === 0  ){
			frappe.throw("No Payment method selected, please select one")
		}
	},
	on_submit: function(frm){
			// Convert ammount to cent
			var formatToCents = function(value) {
				value = (value + '').replace(/[^\d.-]/g, '');
				if (value && value.includes('.')) {
				value = value.substring(0, value.indexOf('.') + 3);
				}
			
				return value ? Math.round(parseFloat(value) * 100) : 0;
			}
			// Create a payment resource
			const payment_methods_url = 'https://api.paymongo.com/v1/payment_methods';
			const payment_method = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Basic cGtfdGVzdF84MnR6QndIMnd0b0tWYmtCTENENWptMXY6'
				},
				body: JSON.stringify({
					data: {
					attributes: {
						details: {
							card_number: frm.doc.debitcredit[0].card_number, 
							exp_month: frm.doc.debitcredit[0].expiration_month, 
							exp_year: frm.doc.debitcredit[0].expiration_year, 
							cvc: frm.doc.debitcredit[0].cvc.toString()
						},
						billing: {
						address: {
							line1: frm.doc.street,
							line2: frm.doc.barangay,
							city:  frm.doc.city,
							state: frm.doc.state,
							postal_code: frm.doc.zip_code,
							country: "PH" // craete a function to convert Philippines to PH
						},
						name: frm.doc.debitcredit[0].full_name_on_the_card,
						email: frm.doc.email,
						phone: frm.doc.phone
						},
						type: 'card' 
					}
					}
				})
			};
			// Create a payment intent
			const payment_intents_url = 'https://api.paymongo.com/v1/payment_intents';
			const payment_intent = {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Basic c2tfdGVzdF91ajNkYW45U0h1aDZIZEF6REVNWFEzUlo6'
				},
				body: JSON.stringify({
					data: {
					attributes: {
						amount: 20000, // craeate a function to covert to cent
						payment_method_allowed: ['card'],
						payment_method_options: {card: {request_three_d_secure: 'any'}},
						currency: 'PHP' // additional feild in table
					}
					}
				})
			};
			// Fetching to payment_method
			fetch(payment_methods_url, payment_method)
			.then(res => res.json())
			.then(json => {
				console.log(json)
				// if success fetch the payment payment_intent
				fetch(payment_intents_url, payment_intent)
				.then(res => res.json())
				.then(json => {
					// If success proceed to payment attachment
					console.log(json)
				})
				// Payment intent error cath
				.catch(err => console.error('error:' + err));
			})
			// Payment method error cath
			.catch(err => console.error('error:' + err));
	}
});


