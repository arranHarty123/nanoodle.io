import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../account.service';
import { BlockService } from '../block.service';
import { MessageService } from '../message.service';
import { MarketService } from '../market.service';
import { MyNanoNinjaService } from '../mynanoninja.service';
import { NodeService } from '../node.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ['./account.component.css']
})

export class AccountComponent implements OnInit {
  //raw results
  accountResults: Account;
  unprocessedBlocksResults: UnprocessedBlocks;
  blockResults: BlockResults;
  representativeResults: Representative;
  weightResults: Weight;
  currencyType: string;
  pastRate: number;
  copied: boolean;
  nanoUrl: SafeUrl;
  tempRate: FiatResults;
  repScore: string;
  utcOffset: string;
  repDelegators: string;
  repLastVoted: string;
  repUptime: number;
  blockTime: BlockTime;
  priceResults: number;
  alias: Object;
  temp: Object;
  balanceResults: Balance;
  blockCountResults: BlockCountResults;
  keys: string[];
  identifier: string;
  //param
  paramsub: any;
  error: string;
  reg = new RegExp('"error"');
  lastPriceTime: string;

  constructor(private sanitizer: DomSanitizer, private messageService: MessageService, private myNanoNinjaService: MyNanoNinjaService, private marketService: MarketService, private NodeService: NodeService, private route: ActivatedRoute, private accountService: AccountService, private blockService: BlockService) { }

  ngOnInit(): void {
    this.paramsub = this.route.params.subscribe(sub => {
      this.identifier = sub['id'].replace(/^xrb/, 'nano');
      //check if the local storage has the currency set
      let storedCurrency = localStorage.getItem('currencyType'); 
      if(storedCurrency) 
      {
        this.currencyType = storedCurrency;
      }
      else
      {
        this.currencyType = 'GBP';
      }
      this.accountResults = null;
      this.representativeResults = null;
      this.weightResults = null;
      this.keys = null;
      this.temp = new Object();
      this.alias = null;
      this.copied = false;
      this.error = null;
      let tz = Math.floor(new Date().getTimezoneOffset() / -60);
      if (tz > -1) {
        this.utcOffset = "+" + tz;
      }
      else {
        this.utcOffset = "" + tz;
      }
      this.balanceResults = null;
      this.blockResults = null;
      this.unprocessedBlocksResults = null;
      this.blockCountResults = null;
      this.repScore = null;
      this.repDelegators = null;
      this.repLastVoted = null;
      this.repUptime = null;
      this.getBlockCount();
      this.getPrice();
      this.getAliases();
      this.getAccount(this.identifier, 20);
      this.getUnprocessedBlocks(this.identifier, 20);
      this.getRepresentative(this.identifier);
      this.getWeight(this.identifier);
      this.getBalance(this.identifier);
      this.nanoUrl = this.sanitizer.bypassSecurityTrustResourceUrl("nano:" + this.identifier);
      this.lastPriceTime = null;
      this.getLastPrice();
    });
  }

  getAliases(): void {
    try {
      this.myNanoNinjaService.getAliases()
        .subscribe(data => {
          if (data != null) {
            for (var i = 0; i < data.length; i++) {
              this.temp[data[i]['account']] = data[i]['alias'];
            }
          }
          this.alias = this.temp;
        });
    } catch (error) {

    }
  }

  getAccountDetails(account: string): void {
    try {
      this.myNanoNinjaService.getAccountDetails(account)
        .subscribe(data => {
          if (data.hasOwnProperty('score')) {
            this.repScore = data['score'];
          }
          if (data.hasOwnProperty('delegators')) {
            this.repDelegators = data['delegators'];
          }
          if (data.hasOwnProperty('lastVoted')) {
            this.repLastVoted = data['lastVoted'];
          }
          if (data.hasOwnProperty('uptime')) {
            this.repUptime = +data['uptime'];
          }
        });
    } catch (error) {

    }
  }

  getLastPrice(): void {
    this.marketService.getLastMarketPrice()
      .subscribe(data => {
        let tempDate = new Date(data[0]['log']['epochTimeStamp']['$date']);
        this.lastPriceTime = this.pad2(tempDate.getDate()) + "-" + this.pad2(tempDate.getMonth() + 1) + "-" + this.pad2(tempDate.getFullYear()) + " " + this.pad2(tempDate.getHours()) + ":" + this.pad2(tempDate.getMinutes());
      });
  }

  //date helper functions
  pad2(n) { return n < 10 ? '0' + n : n }


  getPrice() {
    localStorage.setItem('currencyType',this.currencyType);
    this.priceResults = null;
    this.marketService.getMarketPrice(Date.now(), this.currencyType)
      .subscribe(data => {
        let returnRate = 0;
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            this.tempRate = data[i];
            returnRate = returnRate + this.tempRate[this.currencyType];
          }
          this.priceResults = returnRate / data.length;
        }
        else {
          this.log("Cannot Retrieve Price Data");
        }
      });
  }

  hasAlias(account: string): boolean {
    if (account in this.alias) {
      return true;
    }
    else {
      return false;
    }
  }

  getBlockCount(): void {
    this.NodeService.getBlockCount()
      .subscribe(data => {
        this.blockCountResults = data;
        if (this.reg.test(JSON.stringify(this.blockCountResults))) {
          this.error = JSON.stringify(this.blockCountResults['error']);
        }
      });
  }

  formatDecimals(input: number, places: number): string {
    return input.toFixed(places);
  }

  //RPC block results have a bunch of extra characters that need removing before a parse
  formatContents(jsonRepParam: string): string {
    return jsonRepParam.replace(/\\n/g, "").replace(/\\/g, "").replace(/\"{/g, "{").replace(/}\"/g, "}");
  }

  getAccount(accountParam: string, size: number): void {
    this.accountService.getAccount(accountParam, size)
      .subscribe(data => {
        this.accountResults = data;

      });
  }

  getUnprocessedBlocks(accountParam: string, size: number): void {
    this.accountService.getUnprocessedBlocks(accountParam, size)
      .subscribe(data => {
        this.unprocessedBlocksResults = data;
        this.blockService.getBlocks(this.unprocessedBlocksResults['blocks'])
          .subscribe(data => {
            this.blockResults = JSON.parse(this.formatContents(JSON.stringify(data)));
            if (this.reg.test(JSON.stringify(this.blockResults))) {
              this.error = JSON.stringify(this.blockResults['error']);
            }
            this.keys = Object.keys(this.blockResults['blocks']);
          });
      });
  }

  getWeight(accountParam: string): void {
    this.accountService.getWeight(accountParam)
      .subscribe(data => {
        this.weightResults = data;
      });
  }

  getBalance(accountParam: string): void {
    this.accountService.getBalance(accountParam)
      .subscribe(data => {
        this.balanceResults = data;
      });
  }

  getRepresentative(accountParam: string): void {
    this.accountService.getRepresentative(accountParam)
      .subscribe(data => {
        this.representativeResults = data;
        this.getAccountDetails(this.representativeResults['representative']);
      });
  }

  formatAmount(type: string, amount: number, returnSymbol: boolean): string {
    //Mnano
    if (type == 'XRB') {
      let raw = 1000000000000000000000000000000;

      let temp = amount / raw;
      if (returnSymbol) {
        return temp.toFixed(2);
      }
      else {
        return temp.toFixed(2);

      }
    }
    //nano
    else if (type == 'XNO') {
      let raw = 1000000000000000000000000000;
      let temp = amount / raw;
      if (returnSymbol) {
        return '₦' + temp.toFixed(0);
      }
      else {
        return temp.toFixed(0);
      }
    }
    else if (type == 'ETH') {
      if (returnSymbol) {
        return 'Ξ' + amount.toFixed(6);
      }
      else {
        return amount.toFixed(6);
      }
    }
    else if (type == 'BTC') {
      if (returnSymbol) {
        return '₿' + amount.toFixed(6);
      }
      else {
        return amount.toFixed(6);
      }
    }
    else if (type == 'JPY') {
      if (returnSymbol) {

        return '¥' + amount.toFixed(0);
      }
      else {
        return amount.toFixed(0);
      }
    }
    else if (type == 'CNY') {
      if (returnSymbol) {

        return '¥' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'GHS') {
      if (returnSymbol) {

        return 'Gh₵' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'NGN') {
      if (returnSymbol) {

        return '₦' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'USD') {
      if (returnSymbol) {

        return '$' + amount.toFixed(2);
      }

      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'SEK') {
      if (returnSymbol) {

        return amount.toFixed(2) + 'kr';
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'CHF') {
      if (returnSymbol) {

        return '₣' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'ZAR') {
      if (returnSymbol) {

        return 'R' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'EUR') {
      if (returnSymbol) {

        return '€' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'GBP') {
      if (returnSymbol) {

        return '£' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'CAD') {
      if (returnSymbol) {

        return 'C$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'MXN') {
      if (returnSymbol) {

        return '$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'AUD') {
      if (returnSymbol) {

        return '$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'BRL') {
      if (returnSymbol) {

        return 'R$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'VES') {
      if (returnSymbol) {

        return 'Bs.' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'PEN') {
      if (returnSymbol) {

        return 'S/.' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'VND') {
      if (returnSymbol) {

        return amount.toFixed(2) + '₫';
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'TRY') {
      if (returnSymbol) {

        return '₺' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'INR') {
      if (returnSymbol) {

        return '₹' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'COP') {
      if (returnSymbol) {

        return '$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else if (type == 'ARS') {
      if (returnSymbol) {

        return '$' + amount.toFixed(2);
      }
      else {
        return amount.toFixed(2);
      }
    }
    else {
      return amount.toFixed(2);
    }
  }

  ngOnDestroy() {
    this.paramsub.unsubscribe();
  }

  formatDate(rawDate: string): string {
    return rawDate.match(/\d{2}\/[A-Za-z]{3}\/\d{4}/) + " " + ("" + rawDate.match(/\d{2}:\d{2}:\d{2} /)).trim();
  }

  private log(message: string) {
    this.messageService.add(`Account Component: ${message}`);
  }

  trackElement(index: number, element: any) {
    return element ? element.guid : null;
  }

  copyToClipboard(str: string) {
    var el = document.createElement('textarea');
    el.value = str;
    this.copied = true;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);

    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      // save current contentEditable/readOnly status
      var editable = el.contentEditable;
      var readOnly = el.readOnly;

      // convert to editable with readonly to stop iOS keyboard opening
      el.contentEditable = editable;
      el.readOnly = true;

      // create a selectable range
      var range = document.createRange();
      range.selectNodeContents(el);

      // select the range
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el.setSelectionRange(0, 999999);

      // restore contentEditable/readOnly to original state
      el.contentEditable = editable;
      el.readOnly = readOnly;
    } else {
      el.select();
    }

    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

interface Transaction {
  type: string;
  account: string;
  amount: number;
  hash: string;
}

interface Account {
  account?: string;
  history?: Transaction[];
  previous?: string;
  error?: string;
}

interface UnprocessedBlocks {
  blocks: string[];
}

interface Representative {
  representative: string;
}

interface Weight {
  weight: string;
}

interface Balance {
  balance: string;
  pending: string;
}

interface BlockResults {
  error?: string;
  blocks?: Block[];
}

interface Block {
  [detail: string]: Detail;
}

interface Detail {
  block_account: string;
  amount: string;
  contents: Content;
}
interface Content {
  type: string;
  account: string;
  previous: string;
  representative: string;
  balance: string;
  link: string;
  link_as_account: string;
  signature: string;
  work: string;
}

interface BlockCountResults {
  error?: string;
  count?: number;
  unchecked?: number;
}

interface FiatResults {
  [currencyType: string]: number;
}

interface BlockTime {
  _id: string;
  log: Time;
}

interface Time {
  epochTimeStamp: DateTime;
}

interface DateTime {
  $date: DateTime;
}

interface BlockTime {
  _id: string;
  log: Time;
}

interface Time {
  epochTimeStamp: DateTime;
}

interface DateTime {
  $date: DateTime;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}