// Copyright (c) 2021, Jick Lampago and contributors
// For license information, please see license.txt

frappe.ui.form.on('Paymongo billing info', {
    refresh: function(frm,) { 
        const public_key = 'Basic cGtfdGVzdF84MnR6QndIMnd0b0tWYmtCTENENWptMXY6'
        // URL
        const selectResourceApi = (value) => {
            if(value === "gcash" || value === "grabpay"){
                const url =  "https://api.paymongo.com/v1/sources"
                return url
            }else if(value === "card"){
                const url ="https://api.paymongo.com/v1/payment_methods"
                return url
            }
        }
        const get_country = (value) => {
            let acro = "hey"
            let array = ["Philippines", "China"]
            let acroArray = ["PH","CH"]
            let res = array.indexOf(value);
            acro = acroArray[res]
            return acro
        }

        // craeate a function to covert to cent
        var formatToCents = function(value) {
            value = (value + '').replace(/[^\d.-]/g, '');
            if (value && value.includes('.')) {
            value = value.substring(0, value.indexOf('.') + 3);
            }
            return value ? Math.round(parseFloat(value) * 100) : 0;
        }
        // Errors
        const CvcError = "<p class='px-3 text-muted'><small>Details* <em>Check your cvc number at the back of your card</em></small></p>"
        const cardExpired = "<p class='px-3 text-muted'><small>Details*  <em>If this is a mistake, please double check your expiry date on your card and try again.</em></small></p>"
        const cardInvalid = "<p class='px-3 text-muted'><small>detaiils *<em>  If this is a mistake, please double check your card number and try again.</em></p></small>"
        // Debitt card processing
        const selectPayloadDetails = (value) => {
            if(value === "gcash"){
                const gcash = {
                        amount: formatToCents(frm.doc.gcash_payment[0].amount__in_php_),
                        redirect: {
                            success: `http://localhost:8080/app/paymongo-billing-info/${frm.doc.last_name}%2C%20${frm.doc.first_name}`,
                            failed: "https://www.youtube.com/"
                       },
                        billing: {
                            address: {
                                line1: frm.doc.street,
                                line2: frm.doc.barangay,
                                city:  frm.doc.city,
                                state: frm.doc.state,
                                postal_code: frm.doc.zip_code,
                                country: get_country(frm.doc.country)
                            },
                        name: frm.doc.gcash_payment[0].full_name__rgistered_on_gcash_,
                        email: frm.doc.email,
                        phone: frm.doc.phone_number
                        },
                        type: "gcash",
                        currency: frm.doc.currency
                    }
                return gcash
            }else if(value === "card"){
                const debit = {
                    
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
                                country: get_country(frm.doc.country)
                            },
                        name: "Jick Lampago",
                        email: frm.doc.email,
                        phone: frm.doc.phone_number
                        },
                        type: value
                    }
            
                return debit
            }else if(value === "grabpay"){
                const grabpay = "grabpay"
                return grabpay
            }
            }
            const cardHolderName = (value) => {

            }
            const payload = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: public_key
                },
                body: JSON.stringify({
                    data: {
                        attributes: selectPayloadDetails(frm.doc.payment_selected)
                    }
                })
            }
            const api_url = (selectResourceApi(frm.doc.payment_selected))
            fetch(api_url, payload)
            .then(res => res.json())
            .then(res => {
            
                if(typeof res.data === "undefined"){
                    if(res.errors[0].code === "parameter_invalid" && res.errors[0].source.pointer === "details.exp_year"){
                        $('[data-label="Submit"]').prop( "disabled", true)
                        frappe.throw("<p class='bg-danger p-3 text-white'>Card expired</p>" + cardExpired)
                    }else if(res.errors[0].code === "parameter_invalid" && res.errors[0].source.pointer === "details.card_number"){
                        $('[data-label="Submit"]').prop( "disabled", true)
                        frappe.throw("<p class='bg-danger p-3 text-white'>Invalid card format</p>" + cardInvalid)
                    }else if(res.errors[0].code === "parameter_above_maximum"){
                        $('[data-label="Submit"]').prop( "disabled", true)
                        frappe.throw("<p class='bg-danger p-3 text-white'>cvc cannot be more than 3 characters</p>" + CvcError)
                    }else if(res.errors[0].code === "parameter_below_minimum"){
                        $('[data-label="Submit"]').prop( "disabled", true)
                        frappe.throw("<p class='bg-danger p-3 text-white'>cvc cannot be less than 3 characters</p>" + CvcError)
                    }else if(res.errors[0].code === "parameter_format_invalid" && res.errors[0].source.pointer === "details.card_number"){
                        $('[data-label="Submit"]').prop( "disabled", true)
                        frappe.throw("<p class='bg-danger p-3 text-white'>Invalid card format</p>" + cardInvalid)
                    }
                }else{
                    frm.doc.payment_resource_id = res.data.id
                    if(res.data.attributes.type === "gcash"){
                        location.href = `https://test-sources.paymongo.com/sources?id=${res.data.id}`
                    }
                    
                }
                
            })
            .catch(err => {
                
            });
        
        //console.log(frm)
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
                frm.doc.payment_selected = "gcash"
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
                frm.doc.payment_selected = "card"
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
                frm.doc.payment_selected = "grabpay"
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
    if(frm.fields[9].df.reqd === 0 && frm.fields[10].df.reqd === 0 && frm.fields[11].df.reqd === 0  ){
        frappe.throw("No Payment method selected, please select one")
    }
},
before_submit: function(frm){
    // GLoval variables 
        //Api key
        const public_key = 'Basic cGtfdGVzdF84MnR6QndIMnd0b0tWYmtCTENENWptMXY6'
        const secret_key = 'Basic c2tfdGVzdF91ajNkYW45U0h1aDZIZEF6REVNWFEzUlo6'
        // URL's
        const payment_methods_url = 'https://api.paymongo.com/v1/payment_methods'
        const payment_intents_url = 'https://api.paymongo.com/v1/payment_intents'

    // All funtion goes here
        // function to convert Country name to  alpha-2 codes or two-letter country codes..
        const get_country = (value) => {
            let acro = "hey"
            let array = ["Philippines", "China"]
            let acroArray = ["PH","CH"]
            let res = array.indexOf(value);
            acro = acroArray[res]
            return acro
        }

        // craeate a function to covert to cent
        var formatToCents = function(value) {
            value = (value + '').replace(/[^\d.-]/g, '');
            if (value && value.includes('.')) {
            value = value.substring(0, value.indexOf('.') + 3);
            }
        
            return value ? Math.round(parseFloat(value) * 100) : 0;
        }
        // if payment is success
            const payment_success = (data) => {
                function numberWithCommas(x) {
                    let str = x.toString()
                    var resStr=str.substring(0,str.length-2)+"."+str.substring(str.length-2)
                    let res = resStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    return res
                }
                console.log(data.attributes.payments[0].attributes)
                let success = `
                        <p class='info'>Transaction success</p>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg transaction-detailes p-5">
                                    <h5>Transaction details</h5>
                                    <p class='m-0'>Type				: ${data.attributes.payments[0].attributes.source.type}</p>
                                    <p class='m-0'>Brand			: ${data.attributes.payments[0].attributes.source.brand}</p>
                                    <p class='m-0'>Card number		: ************${data.attributes.payments[0].attributes.source.last4}</p>
                                    <p class='m-0'>Amount			: ${numberWithCommas(data.attributes.payments[0].attributes.amount)}</p>
                                    <p class='m-0'>status			: ${data.attributes.status}</p>
                                </div>
                            </div>
                        </div>
                    `
                $("[data-label='Cancel']").hide()
                $(".icon-btn").hide()
                $('.row.form-section.card-section.visible-section').first().html(success).css({"width": "100%","margin": "0 auto"})
                $(".info").css({"background-color": "rgba(76, 175, 80, 0.3)","padding": "10px","margin": "0"})
                $('table').css({"font-family": "arial, sans-serif","border-collapse": "collapse","width": "100%"})
                $('td, th ').css({"border": "1px solid #dddddd", "text-align": "left", "padding": "8px"})
                $('tr:nth-child(even)').css({"background-color": "#dddddd"})
                $('.transaction-detailes').css({"background-color": "#F6F5F5"})
            }
        // Create a payment resource variable
        const payment_method = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: public_key
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
                        phone: frm.doc.phone,
                        country: get_country(frm.doc.country)
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
        const payment_intent = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: secret_key
            },
            body: JSON.stringify({
                data: {
                attributes: {
                    amount: formatToCents(frm.doc.debitcredit[0].amount_in_php), 
                    description: frm.doc.description,
                    payment_method_allowed: ['card'],
                    payment_method_options: {card: {request_three_d_secure: 'any'}},
                    currency: frm.doc.currency
                }
                }
            })
        };
        // Fetching to paymongo Api
        fetch(payment_methods_url, payment_method)
        .then(res => res.json())
        .then(json => {
            var payment_method_id = json.data.id
            // if success fetch the payment payment_intent
            fetch(payment_intents_url, payment_intent)
            .then(res => res.json())
            .then(json => {
                const payment_attachment = {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: secret_key
                    },
                    body: JSON.stringify({
                    data: {
                        attributes: {
                        payment_method: payment_method_id,
                        client_key: json.data.attributes.client_key
                        }
                    }
                    })
                }
                fetch(payment_intents_url + '/' + json.data.id +'/attach', payment_attachment)
                .then(response => response.json())
                .then(json => {
                    // if success redirect to success url
                    if(json.data.attributes.status === "succeeded"){
                        payment_success(json.data)
                    }else{
                        frappe.throw("Payment failed, try again")
                    }
                })
                .catch(err => {
                    console.error('error:' + err)
                    frappe.throw("error of attachment" + err)
                    validated = false
                });
            })
            // Payment intent error cath
            .catch(err =>  {
                console.error('error:' + err)
                frappe.throw("error of intent" + err)
                validated = false
            });
        })
        // Payment method error cath
        .catch(err => {
            console.error('error:' + err)
            frappe.throw("error of method" + err)
            validated = false
        });
}
});


