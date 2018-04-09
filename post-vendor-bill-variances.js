// ==UserScript==
// @name         Post Vendor Bill Variances
// @namespace    https://system.na2.netsuite.com/
// @version      0.1
// @description  Enhancements to Post Vendor Bill Variances page
// @author       You
// @match        https://system.na2.netsuite.com/app/accounting/transactions/vendorbillvariance/postvendorbillvariances.nl?whence=
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // TEST CHANGE

    // lifted from the inspecting the JS on the Post Vendor Bill Variances page
    function setMachineLineState(linenum, state) {
        nlapiSelectLineItem('bulkmachine', linenum, false);
        if (nlapiGetLineItemField('bulkmachine', 'selected', linenum) != null) {
            if (!nlapiGetLineItemDisabled('bulkmachine','selected', linenum) && true ) nlapiSetCurrentLineItemValue('bulkmachine', 'selected', state ? 'T' : 'F',false);
        }
        else setEncodedValue('bulkmachine',linenum,'selected',state ? 'T' : 'F');
        if (nlapiGetLineItemField('bulkmachine', 'selected', linenum) != null) bulkmachineSyncRow(linenum,true,true);
    }

    function isMatch(s, ids) {
        for (let i=0;i<ids.length;i++) {
            if(s === `Purchase Order #MDPO-${ids[i]}` || s === `Bill #MDPO-${ids[i]}`) {
                return ids[i];
            }
        }
        return false;
    }

    function selectIds(ids) {
        let lines = nlapiGetLineItemCount('bulkmachine');
        for(let i=1;i<=lines;i++){
            setMachineLineState(i, isMatch(getEncodedValue('bulkmachine',i,'trannum'), ids));
        }
    }

    function findIds(ids) {
        let lines = nlapiGetLineItemCount('bulkmachine');
        let results = {};
        for(let i=1;i<=lines;i++){
            let matchId = isMatch(getEncodedValue('bulkmachine',i,'trannum'), ids);
            if(matchId) {
                results[matchId] = Math.floor((i-1)/100)+1;
            }
        }
        return {
            found: results,
            missing: jQuery(ids).not(Object.keys(results)).get()
        };
    }

    // append the button
    let $button, $bar;
    // first button
    $button = jQuery('<td><table cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation"><tbody><tr class="tabBnt"><td class="bntBgB"><input class="rndbuttoninpt bntBgT" type="button" value="Select POs"/></td></tr></tbody></table></td>');
    $bar = jQuery('#tdbody_customize').closest('table').closest('tr');
    $button.click(() => {
        let poIds = prompt('Comma-separated list of POs to select:');
        selectIds(poIds.split(',').map((s) => s.trim()));
    });
    $bar.append($button);
    // second button
    $button = jQuery('<td><table cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation"><tbody><tr class="tabBnt"><td class="bntBgB"><input class="rndbuttoninpt bntBgT" type="button" value="Find POs"/></td></tr></tbody></table></td>');
    $bar = jQuery('#tdbody_customize').closest('table').closest('tr');
    $button.click(() => {
        let poIds = prompt('Comma-separated list of POs to find:');
        console.log(findIds(poIds.split(',').map((s) => s.trim())));
    });
    $bar.append($button);
})();
