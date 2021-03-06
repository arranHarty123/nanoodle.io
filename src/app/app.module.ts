
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';
import { LiveComponent } from './live/live.component';
import { ProductComponent } from './products/products.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MessagesComponent } from './messages/messages.component';
import { FooterComponent } from './footer/footer.component';
import { APIComponent } from './api/api.component';
import { SocialComponent } from './social/social.component';
import { BlockComponent } from './block/block.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountDownloadComponent  } from './accountDownload/accountDownload.component';
import { TransactionRowComponent  } from './transactionRow/transactionRow.component';
import { AccountDownloadComponentDialog  } from './accountDownload/accountDownload.component';
import { AccountInvoiceComponent, AccountInvoiceComponentDialog  } from './accountInvoice/accountInvoice.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DonateComponent, DonateComponentDialog } from './donate/donate.component';
import { TACComponent, TACComponentDialog } from './tac/tac.component';
import { PrivacyComponent, PrivacyComponentDialog } from './privacy/privacy.component';
import { AccountWatchComponent, AccountWatchComponentDialog  } from './accountWatch/accountWatch.component';
import { UnsubscribeComponent  } from './unsubscribe/unsubscribe.component';
import { VerifyComponent } from './verify/verify.component';
import { MarketComponent } from './market/market.component';
import { TransactionGraphComponent } from './transactionGraph/transactionGraph.component';
import { ChartsModule } from 'ng2-charts';

@Component({
  selector: 'my-app',
  templateUrl: 'app.module.html',
  styleUrls: ['app.module.css']
})
export class App {
}

const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'account/:id', component: AccountComponent },
  { path: 'hash/:id', component: AccountComponent },
  { path: 'block/:id', component: BlockComponent },
  { path: 'live', component: LiveComponent },
  { path: 'api', component: APIComponent },
  { path: 'products', component: ProductComponent },
  { path: 'invoice', component: InvoiceComponent },
  { path: 'verify/:id', component: VerifyComponent },
  { path: 'unsubscribe/:id', component: UnsubscribeComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [BrowserModule, ChartsModule, MatDialogModule, FormsModule, BrowserAnimationsModule, MatButtonModule, MatSelectModule, MatDividerModule, MatInputModule, QRCodeModule, ReactiveFormsModule, HttpClientModule, RouterModule.forRoot(
    appRoutes//,{ enableTracing: true } // <-- debugging purposes only
  )],
  declarations: [App, NavbarComponent, TransactionRowComponent, TransactionGraphComponent, UnsubscribeComponent, VerifyComponent, MarketComponent, AccountWatchComponent, AccountWatchComponentDialog, AccountInvoiceComponent, AccountInvoiceComponentDialog,AccountDownloadComponent,AccountDownloadComponentDialog, PrivacyComponent, PrivacyComponentDialog, TACComponent, TACComponentDialog, DonateComponent, DonateComponentDialog, AccountComponent, HomeComponent, LiveComponent, InvoiceComponent, ProductComponent, PageNotFoundComponent, MessagesComponent, APIComponent, FooterComponent, SocialComponent, BlockComponent],
  entryComponents: [ AccountDownloadComponentDialog, PrivacyComponentDialog, TACComponentDialog, DonateComponentDialog, AccountWatchComponentDialog, AccountInvoiceComponentDialog ],
  bootstrap: [App]
})
export class AppModule { }