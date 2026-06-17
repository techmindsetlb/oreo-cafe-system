import React,{useState,useEffect,useRef,useMemo}from'react';
import{BrowserRouter as Router,Routes,Route,Navigate,Link,useNavigate,useLocation}from'react-router-dom';

const T={en:{
  appName:'Cue Corner',login:'Sign In',email:'Email',password:'Password',loggingIn:'Signing in…',
  pos:'POS',gaming:'Gaming',orders:'Orders',menu:'Menu',inventory:'Inventory',tables:'Tables',
  reports:'Reports',employees:'Employees',accounting:'Accounting',logout:'Logout',
  selectOrderType:'How is this order?',takeaway:'Takeaway',dineIn:'Dine In',
  chooseTable:'Select table…',currentOrder:'Current Order',noItems:'No items yet',
  subtotal:'Subtotal',discount:'Discount ($)',total:'Total',notes:'Notes',notesPlh:'Special instructions…',
  clear:'Clear',pay:'Pay Now',payLater:'Open Tab',selectPayment:'Payment Method',
  cash:'Cash',card:'Card',mobile:'Mobile',cancel:'Cancel',close:'Close',
  addEmployee:'Add Employee',editEmployee:'Edit Employee',name:'Full Name',
  role:'Role',phone:'Phone',status:'Status',active:'Active',inactive:'Inactive',
  actions:'Actions',edit:'Edit',delete:'Delete',save:'Save',update:'Update',
  cashier:'Cashier',kitchen:'Kitchen',manager:'Manager',admin:'Admin',waiter:'Waiter',
  menuMgmt:'Menu',items:'Items',categories:'Categories',addItem:'Add Item',addCategory:'Add Category',
  price:'Price',prepTime:'Prep (min)',available:'Available',category:'Category',description:'Description',
  inventoryMgmt:'Inventory',addInventory:'Add',quantity:'Quantity',unit:'Unit',
  minQty:'Min Qty',costPerUnit:'Cost/Unit',adjust:'Adjust',lowStock:'Low Stock',
  tablesMgmt:'Tables & Stations',addTable:'Add',tableNum:'Number',seats:'Seats',
  section:'Section',type:'Type',hourlyRate:'Rate/hr',startSession:'Start',endSession:'End Session',
  reserve:'Reserve',cancelRes:'Cancel Res.',guestName:'Guest Name',guestPhone:'Guest Phone',
  salesReports:'Reports',daily:'Daily',weekly:'Weekly',monthly:'Monthly',range:'Custom Range',
  totalOrders:'Orders',revenue:'Revenue',popularItems:'Popular Items',itemSales:'Sales by Item',
  allStatuses:'All Statuses',allTypes:'All Types',fromDate:'From',toDate:'To',printReport:'Print Report',
  pending:'Pending',preparing:'Preparing',ready:'Ready',completed:'Completed',cancelled:'Cancelled',
  table:'Table',employee:'Employee',paymentStatus:'Payment',paid:'Paid',unpaid:'Unpaid',
  accounting:'Accounting',incomeStatement:'P&L',cashFlow:'Cash Flow',expenses:'Expenses',
  addExpense:'Add Expense',expCategory:'Category',amount:'Amount',date:'Date',expDesc:'Description',
  rent:'Rent',utilities:'Utilities',salaries:'Salaries',supplies:'Supplies',maintenance:'Maintenance',other:'Other',
  totalRevenue:'Revenue',totalExpenses:'Expenses',netProfit:'Net Profit',grossMargin:'Margin',
  opEx:'Op. Expenses',cogs:'COGS',thisMonth:'This Month',overview:'Overview',
  invoice:'Invoice',printInvoice:'Print Invoice',invoiceNum:'Invoice',closeBill:'Close & Pay',
  confirmDelete:'Are you sure?',backToMenu:'Back',orderDone:'✓ Order complete!',
  switchLang:'العربية',newTab:'+ New Order',tabLabel:'Order',
  businessDay:'Business Day',openDay:'Open Day',closeDay:'Close Day',dayOpen:'Open',dayClosed:'Closed',
  openingCash:'Opening Cash',closingCash:'Closing Cash',dayHistory:'Day History',
  qrPayment:'Mobile Pay QR',uploadQR:'Upload QR',currentQR:'Current QR',
  uploadProof:'Upload Payment Proof',verifyPayment:'Verify Payment',verified:'✓ Verified',
  addPerson:'Add Person',personLabel:'Person Name',payPerson:'Pay This Person',
  personPaid:'Paid',splitBill:'Split Bill',customers:'Customers',addCustomer:'Add Customer',editCustomer:'Edit Customer',customerName:'Customer Name',customerPhone:'Phone',customerEmail:'Email',customerNotes:'Notes',customerSince:'Customer since',noCustomers:'No customers yet',searchCustomer:'Search customers...',dispatch:'Print Dispatch',branding:'Branding',settings:'Settings',
  superadmin:'Super Admin',
  rp_superadmin:'Full Access — Settings, Users & Passwords',
  rp_cashier:'POS · Orders · Tables · Gaming',
  rp_waiter:'POS · Orders · Tables · Gaming',
  rp_kitchen:'View Orders · Update Status',
  rp_manager:'POS · Orders · Menu · Tables · Reports · Gaming · Inventory',
  rp_admin:'POS · Orders · Menu · Tables · Reports · Gaming · Inventory · Accounting · Employees',
},ar:{
  appName:'Cue Corner',login:'تسجيل الدخول',email:'البريد الإلكتروني',password:'كلمة المرور',
  loggingIn:'جاري الدخول…',
  pos:'نقطة البيع',gaming:'الألعاب',orders:'الطلبات',menu:'القائمة',inventory:'المخزون',
  tables:'الطاولات',reports:'التقارير',employees:'الموظفون',accounting:'المحاسبة',logout:'خروج',
  selectOrderType:'كيف هذا الطلب؟',takeaway:'تيك أواي',dineIn:'داخل المحل',
  chooseTable:'اختر طاولة…',currentOrder:'الطلب الحالي',noItems:'لا توجد عناصر',
  subtotal:'المجموع الفرعي',discount:'خصم ($)',total:'الإجمالي',notes:'ملاحظات',notesPlh:'تعليمات خاصة…',
  clear:'مسح',pay:'ادفع الآن',payLater:'فتح حساب',selectPayment:'طريقة الدفع',
  cash:'نقداً',card:'بطاقة',mobile:'موبايل',cancel:'إلغاء',close:'إغلاق',
  addEmployee:'إضافة موظف',editEmployee:'تعديل موظف',name:'الاسم الكامل',
  role:'الدور',phone:'الهاتف',status:'الحالة',active:'نشط',inactive:'غير نشط',
  actions:'إجراءات',edit:'تعديل',delete:'حذف',save:'حفظ',update:'تحديث',
  cashier:'كاشير',kitchen:'مطبخ',manager:'مدير',admin:'مشرف',waiter:'نادل',
  menuMgmt:'القائمة',items:'العناصر',categories:'الفئات',addItem:'إضافة عنصر',addCategory:'إضافة فئة',
  price:'السعر',prepTime:'التحضير (د)',available:'متاح',category:'الفئة',description:'الوصف',
  inventoryMgmt:'المخزون',addInventory:'إضافة',quantity:'الكمية',unit:'الوحدة',
  minQty:'الحد الأدنى',costPerUnit:'التكلفة/وحدة',adjust:'تعديل',lowStock:'مخزون منخفض',
  tablesMgmt:'الطاولات والمحطات',addTable:'إضافة',tableNum:'الرقم',seats:'المقاعد',
  section:'القسم',type:'النوع',hourlyRate:'السعر/ساعة',startSession:'ابدأ',endSession:'إنهاء',
  reserve:'حجز',cancelRes:'إلغاء الحجز',guestName:'اسم الضيف',guestPhone:'هاتف الضيف',
  salesReports:'التقارير',daily:'يومي',weekly:'أسبوعي',monthly:'شهري',range:'نطاق مخصص',
  totalOrders:'الطلبات',revenue:'الإيرادات',popularItems:'الأكثر طلباً',itemSales:'مبيعات كل عنصر',
  allStatuses:'كل الحالات',allTypes:'كل الأنواع',fromDate:'من',toDate:'إلى',printReport:'طباعة التقرير',
  pending:'معلق',preparing:'قيد التحضير',ready:'جاهز',completed:'مكتمل',cancelled:'ملغى',
  table:'طاولة',employee:'موظف',paymentStatus:'الدفع',paid:'مدفوع',unpaid:'غير مدفوع',
  accounting:'المحاسبة',incomeStatement:'قائمة الدخل',cashFlow:'التدفق النقدي',expenses:'المصاريف',
  addExpense:'إضافة مصروف',expCategory:'الفئة',amount:'المبلغ',date:'التاريخ',expDesc:'الوصف',
  rent:'إيجار',utilities:'خدمات',salaries:'رواتب',supplies:'مستلزمات',maintenance:'صيانة',other:'أخرى',
  totalRevenue:'الإيرادات',totalExpenses:'المصاريف',netProfit:'صافي الربح',grossMargin:'هامش الربح',
  opEx:'المصاريف التشغيلية',cogs:'تكلفة البضاعة',thisMonth:'هذا الشهر',overview:'نظرة عامة',
  invoice:'فاتورة',printInvoice:'طباعة الفاتورة',invoiceNum:'فاتورة',closeBill:'إغلاق والدفع',
  confirmDelete:'هل أنت متأكد؟',backToMenu:'رجوع',orderDone:'✓ اكتمل الطلب!',
  switchLang:'English',newTab:'+ طلب جديد',tabLabel:'طلب',
  businessDay:'يوم العمل',openDay:'فتح اليوم',closeDay:'إغلاق اليوم',dayOpen:'مفتوح',dayClosed:'مغلق',
  openingCash:'نقد الافتتاح',closingCash:'نقد الإغلاق',dayHistory:'سجل الأيام',
  qrPayment:'رمز QR للدفع',uploadQR:'رفع رمز QR',currentQR:'الرمز الحالي',
  uploadProof:'رفع إثبات الدفع',verifyPayment:'تحقق من الدفع',verified:'✓ تم التحقق',
  addPerson:'إضافة شخص',personLabel:'اسم الشخص',payPerson:'دفع هذا الشخص',
  personPaid:'دفع',splitBill:'تقسيم الحساب',customers:'العملاء',addCustomer:'إضافة عميل',editCustomer:'تعديل عميل',customerName:'اسم العميل',customerPhone:'الهاتف',customerEmail:'البريد',customerNotes:'ملاحظات',customerSince:'عميل منذ',noCustomers:'لا يوجد عملاء',searchCustomer:'بحث عن عملاء...',dispatch:'طباعة التوصيل',branding:'العلامة التجارية',settings:'الإعدادات',
  superadmin:'مشرف عام',
  rp_superadmin:'الوصول الكامل — الإعدادات والمستخدمين وكلمات المرور',
  rp_cashier:'نقطة البيع · الطلبات · الطاولات · الألعاب',
  rp_waiter:'نقطة البيع · الطلبات · الطاولات · الألعاب',
  rp_kitchen:'عرض الطلبات · تحديث الحالة',
  rp_manager:'نقطة البيع · الطلبات · القائمة · الطاولات · التقارير · الألعاب · المخزون',
  rp_admin:'نقطة البيع · الطلبات · القائمة · الطاولات · التقارير · الألعاب · المخزون · المحاسبة · الموظفون',
}};

const PERMS={
  cashier:['pos','orders_view','tables_view','tables_manage','gaming'],
  waiter: ['pos','orders_view','tables_view','tables_manage','gaming'],
  kitchen:['orders_view','orders_status'],
  manager:['pos','orders_view','orders_status','menu_view','tables_view','tables_manage','reports','inventory_view','gaming','business_day','accounting','customers'],
  superadmin:['pos','orders_view','orders_status','menu_view','menu_manage','tables_view','tables_manage','reports','inventory_view','inventory_manage','employees','accounting','gaming','business_day','settings','customers'],
  admin:  ['pos','orders_view','orders_status','menu_view','menu_manage','tables_view','tables_manage','reports','inventory_view','inventory_manage','employees','accounting','gaming','business_day','customers'],
};
const can=(role,p)=>(PERMS[role]||[]).includes(p);

const apiFetch=async(method,path,body)=>{
  const token=localStorage.getItem('token');
  const res=await fetch(`/api${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})});
  if(res.status===401||res.status===403){localStorage.clear();window.location.href='/login';}
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||'Failed');
  return data;
};
const api={
  login:(e,p)=>apiFetch('POST','/employees/login',{email:e,password:p}),
  employees:{getAll:()=>apiFetch('GET','/employees'),create:d=>apiFetch('POST','/employees',d),update:(id,d)=>apiFetch('PUT',`/employees/${id}`,d),delete:id=>apiFetch('DELETE',`/employees/${id}`),resetPassword:(id,p)=>apiFetch('POST',`/employees/${id}/reset-password`,{password:p})},
  menu:{getCategories:()=>apiFetch('GET','/menu/categories'),createCategory:d=>apiFetch('POST','/menu/categories',d),deleteCategory:id=>apiFetch('DELETE',`/menu/categories/${id}`),getItems:()=>apiFetch('GET','/menu/items'),createItem:d=>apiFetch('POST','/menu/items',d),updateItem:(id,d)=>apiFetch('PUT',`/menu/items/${id}`,d),deleteItem:id=>apiFetch('DELETE',`/menu/items/${id}`)},
  inventory:{getAll:()=>apiFetch('GET','/inventory'),getLowStock:()=>apiFetch('GET','/inventory/low'),create:d=>apiFetch('POST','/inventory',d),update:(id,d)=>apiFetch('PUT',`/inventory/${id}`,d),adjust:(id,d)=>apiFetch('POST',`/inventory/${id}/adjust`,d),delete:id=>apiFetch('DELETE',`/inventory/${id}`)},
  tables:{getAll:()=>apiFetch('GET','/tables'),create:d=>apiFetch('POST','/tables',d),updateStatus:(id,s)=>apiFetch('PUT',`/tables/${id}/status`,{status:s}),reserve:(id,d)=>apiFetch('PUT',`/tables/${id}/reserve`,d),cancelReservation:id=>apiFetch('PUT',`/tables/${id}/cancel-reservation`),delete:id=>apiFetch('DELETE',`/tables/${id}`),startSession:id=>apiFetch('POST',`/tables/${id}/start-session`),endSession:id=>apiFetch('POST',`/tables/${id}/end-session`)},
  orders:{getAll:p=>apiFetch('GET',`/orders${p?'?'+new URLSearchParams(p):''}`),getOne:id=>apiFetch('GET',`/orders/${id}`),create:d=>apiFetch('POST','/orders',d),addItems:(id,items)=>apiFetch('POST',`/orders/${id}/items`,{items}),addPerson:(id,label)=>apiFetch('POST',`/orders/${id}/persons`,{label}),payPerson:(oid,pid,method)=>apiFetch('PUT',`/orders/${oid}/persons/${pid}/pay`,{method}),updateStatus:(id,s)=>apiFetch('PUT',`/orders/${id}/status`,{status:s}),processPayment:(id,m)=>apiFetch('PUT',`/orders/${id}/payment`,{payment_method:m}),markPaid:(id,method)=>apiFetch('PUT',`/orders/${id}/mark-paid`,{payment_method:method||'cash'}),markUnpaid:id=>apiFetch('PUT',`/orders/${id}/mark-unpaid`),delete:id=>apiFetch('DELETE',`/orders/${id}`)},
  reports:{getDaily:date=>apiFetch('GET',`/reports/daily?date=${date}`),getWeekly:()=>apiFetch('GET','/reports/weekly'),getMonthly:m=>apiFetch('GET',`/reports/monthly${m?'?month='+m:''}`),getRange:(f,t)=>apiFetch('GET',`/reports/range?from=${f}&to=${t}`)},
  settings:{get:k=>apiFetch('GET',`/settings/${k}`),set:(k,v)=>apiFetch('PUT',`/settings/${k}`,{value:v})},
  backup:{create:()=>apiFetch('POST','/settings/backup'),list:()=>apiFetch('GET','/settings/backups'),restore:fn=>apiFetch('POST','/settings/backup/restore',{filename:fn})},
  businessDay:{today:()=>apiFetch('GET','/business-day/today'),history:()=>apiFetch('GET','/business-day'),open:d=>apiFetch('POST','/business-day/open',d),close:d=>apiFetch('POST','/business-day/close',d),expectedCash:()=>apiFetch('GET','/business-day/expected-cash')},
  customers:{getAll:s=>apiFetch('GET',`/customers${s?'?search='+encodeURIComponent(s):''}`),create:d=>apiFetch('POST','/customers',d),update:(id,d)=>apiFetch('PUT',`/customers/${id}`,d),delete:id=>apiFetch('DELETE',`/customers/${id}`)}, expenses:{getAll:p=>apiFetch('GET',`/expenses${p?'?'+new URLSearchParams(p):''}`),getOne:id=>apiFetch('GET',`/expenses/${id}`),create:d=>apiFetch('POST','/expenses',d),bulkImport:exps=>apiFetch('POST','/expenses/bulk',{expenses:exps}),update:(id,d)=>apiFetch('PUT',`/expenses/${id}`,d),delete:id=>apiFetch('DELETE',`/expenses/${id}`)}
};

// v2: expenses stored in DB via API. expDB keeps localStorage as fallback.
const expDB={all:()=>JSON.parse(localStorage.getItem('cafe_expenses')||'[]'),add:e=>{const a=expDB.all(),n={...e,id:Date.now()};localStorage.setItem('cafe_expenses',JSON.stringify([n,...a]));return n;},del:id=>localStorage.setItem('cafe_expenses',JSON.stringify(expDB.all().filter(e=>e.id!==id)))};
const draftDB={getAll:()=>JSON.parse(localStorage.getItem('cafe_drafts')||'[]'),saveAll:d=>localStorage.setItem('cafe_drafts',JSON.stringify(d))};
const gamingDB={get:()=>JSON.parse(localStorage.getItem('cafe_gaming')||'null'),set:s=>localStorage.setItem('cafe_gaming',JSON.stringify(s)),clear:()=>localStorage.removeItem('cafe_gaming')};

const LangCtx=React.createContext({lang:'en',t:T.en,setLang:()=>{},appName:T.en.appName,setAppName:()=>{}});
const useLang=()=>React.useContext(LangCtx);

function Toast({msg,onDone}){useEffect(()=>{const id=setTimeout(onDone,2800);return()=>clearTimeout(id);},[onDone]);return<div className="toast">{msg}</div>;}

function fmtInv(n){return'#'+String(n).padStart(4,'0');}
function printWin(html){const w=window.open('','_blank');w.document.write(html);w.document.close();}

function buildInvoiceHTML(order,lang,t,empName){
  const inv=order.invoice_formatted||fmtInv(order.invoice_number||order.id);
  const items=(order.items||[]).map(i=>`<div class="row"><span>${i.name||i.item_name}${i.person_label?' ('+i.person_label+')':''} x${i.quantity}</span><span>$${(parseFloat(i.unit_price||0)*i.quantity).toFixed(2)}</span></div>`).join('');
  return`<!DOCTYPE html><html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}"><head><meta charset="utf-8"><title>${inv}</title><style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;font-size:12px;width:310px;margin:0 auto;padding:18px;background:#fff;color:#000}
.brand{text-align:center;margin-bottom:14px;border-bottom:1px solid #000;padding-bottom:10px}
.brand-name{font-family:Georgia,serif;font-size:22px;font-style:italic;letter-spacing:1px;color:#000}
.brand-sub{font-size:10px;color:#000;margin-top:2px}
.inv-badge{text-align:center;font-size:15px;font-weight:bold;letter-spacing:3px;padding:5px 10px;border:1.5px solid #111;display:inline-block;margin:0 auto 10px}
.center{text-align:center}
.divider{border-top:1px solid #000;margin:8px 0}
.solid{border-top:1px solid #111;margin:6px 0}
.meta{font-size:10px;color:#000;margin:2px 0}
.row{display:flex;justify-content:space-between;font-size:11px;margin:3px 0;padding:1px 0}
.row.bold{font-weight:bold;font-size:13px}
.row.total{border-top:1.5px solid #111;padding-top:5px;margin-top:5px;font-weight:bold;font-size:14px}
.footer{text-align:center;margin-top:14px;font-family:Georgia,serif;font-style:italic;font-size:11px;color:#000;border-top:1px dashed #000;padding-top:8px}
@media print{body{width:auto}}</style></head><body>
<div class="brand"><div class="brand-name">☕ ${t.appName}</div><div class="brand-sub">${new Date(order.created_at||Date.now()).toLocaleString()}</div></div>
<div class="center"><div class="inv-badge">${inv}</div></div>
<div class="divider"></div>
<div class="meta">${t.employee||'Staff'}: <b>${order.employee_name||empName||'-'}</b></div>
<div class="meta">${order.order_type==='dine-in'?(t.dineIn||'Dine-In')+(order.table_number?' · T'+order.table_number:''):(t.takeaway||'Takeaway')}</div>
${order.notes?`<div class="meta">📝 ${order.notes}</div>`:''}
<div class="divider"></div>
${items}
<div class="solid"></div>
<div class="row"><span>${t.subtotal}:</span><span>$${parseFloat(order.subtotal||0).toFixed(2)}</span></div>
${parseFloat(order.discount||0)>0?`<div class="row"><span>${t.discount}:</span><span>-$${parseFloat(order.discount).toFixed(2)}</span></div>`:''}
<div class="row total"><span>${t.total}:</span><span>$${parseFloat(order.total||0).toFixed(2)}</span></div>
${order.payment_method?`<div class="row"><span>Payment:</span><span style="text-transform:capitalize">${order.payment_method}</span></div>`:''}
<div class="footer">${lang==='ar'?'شكراً لزيارتكم — نتمنى لكم يوماً سعيداً':'Thank you for visiting — Have a wonderful day'}</div>
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1200)}<\/script></body></html>`;
}

function buildDispatchHTML(order,lang,t){
  const inv=order.invoice_formatted||fmtInv(order.invoice_number||order.id);
  const merged={};
  (order.items||[]).forEach(i=>{
    const key=i.name||i.item_name;
    if(!merged[key])merged[key]={name:key,qty:0,category:i.category_name||'Items'};
    merged[key].qty+=i.quantity;
  });
  const byCategory={};Object.values(merged).forEach(i=>{
    if(!byCategory[i.category])byCategory[i.category]=[];
    byCategory[i.category].push(i);
  });
  const cats=Object.entries(byCategory).map(([cat,its])=>`
    <div class="cat-block">
      <div class="cat-hd">${cat}</div>
      ${its.map(i=>`<div class="drow"><span>${i.name}</span><span class="dqty">x${i.qty}</span></div>`).join("")}
    </div>`).join("");
  return`<!DOCTYPE html><html><head><meta charset=utf-8><title>Dispatch ${inv}</title><style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;width:300px;margin:0 auto;padding:14px;background:#fff;color:#000}
.hdr{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px}
.hdr h1{font-size:18px;font-weight:bold;letter-spacing:2px}
.hdr p{font-size:10px;margin-top:2px;color:#000}
.tbl-num{font-size:28px;font-weight:bold;text-align:center;border:2px solid #000;padding:6px 12px;margin:8px auto;display:inline-block}
.inv-ref{text-align:center;font-size:11px;color:#000;margin-bottom:8px}
.cat-block{margin:8px 0;padding-top:6px;border-top:1px dashed #000}
.cat-hd{font-weight:bold;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#000;margin-bottom:4px}
.drow{display:flex;justify-content:space-between;font-size:14px;padding:2px 0;border-bottom:1px dotted #eee}
.dqty{font-weight:bold;font-size:18px;min-width:30px;text-align:right}
.notes{margin-top:8px;font-size:11px;border-top:1px dashed #000;padding-top:6px;color:#000}
.footer{text-align:center;margin-top:10px;font-size:9px;color:#000;border-top:1px solid #eee;padding-top:6px}
.center{text-align:center}
@media print{body{width:auto}}
</style></head><body>
<div class="hdr"><h1>KITCHEN DISPATCH</h1><p>${new Date().toLocaleString()}</p></div>
<div class="center">${order.table_number?`<div class="tbl-num">TABLE ${order.table_number}</div>`:'<div class="tbl-num">TAKEAWAY</div>'}</div>
<div class="inv-ref">${inv}</div>
${cats}
${order.notes?`<div class="notes"> ${order.notes}</div>`:""}
<div class="footer">&mdash; Kitchen Copy &middot; Do not discard &mdash;</div>
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1200)}<\/script></body></html>`;
}function buildReportHTML(data,period,lang,t){
  const summary=`<div style="display:flex;gap:16px;flex-wrap:wrap;margin:12px 0">${[
    [data.total_orders||data.totalOrders||0,t.totalOrders||'Orders'],
    ['$'+parseFloat(data.total_revenue||data.totalRevenue||0).toFixed(2),t.revenue||'Revenue']
  ].map(([v,l])=>`<div style="background:#f5f5f5;padding:10px 16px;border-radius:6px;min-width:120px"><div style="font-size:20px;font-weight:bold">${v}</div><div style="font-size:10px;color:#000;margin-top:2px">${l}</div></div>`).join('')}</div>`;
  const itemRows=(data.itemSales||data.topItems||data.popularItems||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.name}</td><td>${it.category||'-'}</td><td>${it.total_quantity}</td><td>$${parseFloat(it.total_revenue).toFixed(2)}</td></tr>`).join('');
  const dayRows=(data.dailyBreakdown||[]).map(d=>`<tr><td>${d.date}</td><td>${d.total_orders}</td><td>$${parseFloat(d.total_revenue).toFixed(2)}</td></tr>`).join('');
  return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title><style>
body{font-family:Arial,sans-serif;font-size:12px;padding:20px;color:#000;max-width:900px;margin:0 auto}
h1{font-size:18px;margin-bottom:2px}h2{font-size:13px;margin:16px 0 6px;color:#000;border-bottom:1px solid #ddd;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#1c110a;color:#fff;padding:6px 10px;text-align:left;font-size:11px}
td{padding:5px 10px;border-bottom:1px solid #f0f0f0;font-size:11px}tr:hover td{background:#fafafa}
@media print{body{padding:0}}</style></head><body>
<h1>☕ ${t.appName} — ${t.salesReports||'Sales Report'}</h1>
<p style="color:#000;font-size:11px">${period} · Printed ${new Date().toLocaleString()}</p>
${summary}
${dayRows?`<h2>Daily Breakdown</h2><table><thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>${dayRows}</tbody></table>`:''}
${itemRows?`<h2>${t.itemSales||'Sales by Item'}</h2><table><thead><tr><th>#</th><th>Item</th><th>Category</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>${itemRows}</tbody></table>`:''}
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1200)}<\/script></body></html>`;
}

function Guard({perm,children}){
  const token=localStorage.getItem('token');
  const emp=JSON.parse(localStorage.getItem('employee')||'{}');
  if(!token)return<Navigate to="/login" replace/>;
  if(perm&&!can(emp.role,perm))return<Navigate to="/pos" replace/>;
  return children;
}

function Sidebar({lang,setLang}){
  const nav=useNavigate(),{pathname}=useLocation(),{t,appName}=useLang();
  const emp=JSON.parse(localStorage.getItem('employee')||'{}');
  const gaming=gamingDB.get();
  const links=[
    {to:'/pos',label:t.pos,icon:'⊞',perm:'pos'},{to:'/gaming',label:t.gaming,icon:'🎮',perm:'gaming'},
    {to:'/orders',label:t.orders,icon:'📋',perm:'orders_view'},{to:'/menu',label:t.menu,icon:'🍽',perm:'menu_view'},
    {to:'/inventory',label:t.inventory,icon:'📦',perm:'inventory_view'},{to:'/tables',label:t.tables,icon:'🪑',perm:'tables_view'},
    {to:'/reports',label:t.reports,icon:'📊',perm:'reports'},{to:'/accounting',label:t.accounting,icon:'💰',perm:'accounting'},
    {to:'/employees',label:t.employees,icon:'👥',perm:'employees'},{to:'/customers',label:t.customers,icon:'👤',perm:'customers'},
    {to:'/business-day',label:t.businessDay,icon:'📅',perm:'business_day'},
    {to:'/settings',label:t.settings,icon:'🎨',perm:'settings'},
  ].filter(l=>can(emp.role,l.perm));
  return(<aside className="sidebar">
    <div className="sb-logo"><span className="sb-logo-icon">☕</span><span className="sb-logo-text">{appName}</span></div>
    <div className="sb-user"><div className="sb-avatar">{(emp.name||'U')[0].toUpperCase()}</div>
      <div className="sb-meta"><span className="sb-name">{emp.name}</span><span className="sb-role">{t[emp.role]||emp.role}</span></div></div>
    <nav className="sb-nav">{links.map(l=><Link key={l.to} to={l.to} className={`sb-link${pathname===l.to?' active':''}`}>
      <span className="sb-link-icon">{l.icon}</span><span>{l.label}</span>
      {l.to==='/gaming'&&gaming&&<span className="sb-badge">●</span>}
    </Link>)}</nav>
    <div className="sb-foot">
      <button className="btn-lang" onClick={()=>setLang(lang==='en'?'ar':'en')}>🌐 {t.switchLang}</button>
      <button className="btn-logout" onClick={()=>{localStorage.clear();nav('/login');}}>↩ {t.logout}</button>
      <div className="sb-credit">Developed by <a href="https://techmindset-lb.com/" target="_blank" rel="noopener noreferrer">Tech Mindset Lb</a></div>
    </div>
  </aside>);
}
function Shell({children,lang,setLang}){const{lang:l}=useLang();return(<div className="shell" dir={l==='ar'?'rtl':'ltr'}><Sidebar lang={lang} setLang={setLang}/><main className="shell-main">{children}</main></div>);}

function LoginPage(){
  const{t,lang,setLang,appName}=useLang();const[email,setEmail]=useState('');const[pw,setPw]=useState('');const[err,setErr]=useState('');const[busy,setBusy]=useState(false);const nav=useNavigate();
  const submit=async e=>{e.preventDefault();setBusy(true);setErr('');try{const d=await api.login(email,pw);localStorage.setItem('token',d.token);localStorage.setItem('employee',JSON.stringify(d.employee));nav('/pos');}catch(ex){setErr(ex.message);}finally{setBusy(false);}};
  return(<div className="login-bg" dir={lang==='ar'?'rtl':'ltr'}><div className="login-card">
    <div className="login-brand"><span className="login-emo">☕</span><h1>{appName}</h1></div>
    {err&&<div className="alert alert-danger">{err}</div>}
    <form onSubmit={submit}>
      <div className="field"><label>{t.email}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email||'your@email.com'} required/></div>
      <div className="field"><label>{t.password}</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" required/></div>
      <button className="btn-primary btn-full" disabled={busy}>{busy?t.loggingIn:t.login}</button>
    </form>
    <button className="btn-lang mt-sm" onClick={()=>setLang(lang==='en'?'ar':'en')}>🌐 {t.switchLang}</button>
    <div className="login-dev-credit">Developed by <a href="https://techmindset-lb.com/" target="_blank" rel="noopener noreferrer">Tech Mindset Lb</a> © {new Date().getFullYear()}</div>
  </div></div>);
}

function InvoiceModal({order,onClose}){
  const{t,lang,appName}=useLang();
  const emp=JSON.parse(localStorage.getItem('employee')||'{}');
  const inv=order.invoice_formatted||fmtInv(order.invoice_number||order.id);
  return(<div className="modal-bg" onClick={onClose}><div className="invoice-modal" onClick={e=>e.stopPropagation()}>
    <div className="inv-top"><div><div className="inv-brand">☕ {appName}</div><div className="inv-date">{new Date(order.created_at||Date.now()).toLocaleString()}</div></div><div className="inv-badge">{inv}</div></div>
    <div className="inv-divider dashed"/>
    <div className="inv-meta-row"><span>👤 {order.employee_name||emp.name}</span><span>{order.order_type==='dine-in'?`🪑 ${t.dineIn}${order.table_number?' · T'+order.table_number:''}` :`🛍️ ${t.takeaway}`}</span></div>
    {order.notes&&<div className="inv-note">📝 {order.notes}</div>}
    <div className="inv-divider dashed"/>
    <div className="inv-items-list">{(order.items||[]).map((it,i)=><div key={i} className="inv-item"><span>{it.name||it.item_name}{it.person_label&&` (${it.person_label})`} <span className="inv-qty">×{it.quantity}</span></span><span>${(parseFloat(it.unit_price||0)*it.quantity).toFixed(2)}</span></div>)}</div>
    <div className="inv-divider"/>
    <div className="inv-totals-block">
      <div className="inv-row-sm"><span>{t.subtotal}</span><span>${parseFloat(order.subtotal||0).toFixed(2)}</span></div>
      {parseFloat(order.discount||0)>0&&<div className="inv-row-sm"><span>{t.discount}</span><span>−${parseFloat(order.discount).toFixed(2)}</span></div>}
      <div className="inv-row-total"><span>{t.total}</span><span>${parseFloat(order.total||0).toFixed(2)}</span></div>
      {order.payment_method&&<div className="inv-row-sm pay-row"><span>Payment</span><span style={{textTransform:'capitalize'}}>{order.payment_method}</span></div>}
    </div>
    <div className="inv-thank">{lang==='ar'?'شكراً لزيارتكم ☕':'Thank you for your visit ☕'}</div>
    <div className="inv-actions">
      <button className="btn-ghost flex-1" onClick={onClose}>{t.close}</button>
      <button className="btn-primary flex-1" onClick={()=>{printWin(buildInvoiceHTML(order,lang,{...t,appName},emp.name));onClose();}}>🖨️ {t.printInvoice}</button>
    </div>
  </div></div>);
}

// Category icons: use DB icon if available, fallback to hardcoded map
const getCatIcon=cat=>cat.icon||({'Hot Drinks':'☕','Cold Drinks':'🥤','Snacks':'🥐','Food':'🍔','Hookah':'💨','Shisha':'💨','Smoking':'💨','Lounge':'🛋️','Ice Cream':'🍦','Desserts':'🧁','Juices':'🧃','Beer':'🍺','Wine':'🍷','Entertainment':'🎮','Playstation':'🎮','PC':'🖥','Billiards':'🎱','Babyfoot':'⚽'}[cat.name]||'🍽');
const newDraft=()=>({draftId:Date.now(),orderType:null,selTable:'',cart:[],discount:0,notes:'',openOrderId:null,persons:[],paidPersons:[]});
const ALL_ICONS={
  '☕':'Coffee','🫖':'Teapot','🍵':'Tea','🥛':'Milk','🍶':'Sake',
  '🥤':'Cup','🧃':'Juice','🧊':'Ice','🫗':'Pour','🍺':'Beer','🍻':'Cheers','🍷':'Wine','🥂':'Champagne','🍸':'Cocktail','🍹':'Tropical','🍾':'Bottle','💧':'Drop','🧉':'Mate',
  '🍔':'Burger','🍕':'Pizza','🌮':'Taco','🌯':'Burrito','🥙':'Wrap','🥪':'Sandwich','🌭':'Hot Dog','🍟':'Fries','🥩':'Steak','🍗':'Drumstick','🍖':'Bone','🥓':'Bacon','🍳':'Fry','🧇':'Waffle','🥞':'Pancake','🥐':'Croissant','🥨':'Pretzel','🧀':'Cheese',
  '🍜':'Noodles','🍝':'Pasta','🍣':'Sushi','🍱':'Bento','🍛':'Curry','🍲':'Stew','🥘':'Paella','🫓':'Flatbread','🥟':'Dumpling','🫔':'Tamale','🥠':'Cookie','🥮':'Mooncake',
  '🥗':'Salad','🥦':'Broccoli','🥕':'Carrot','🌽':'Corn','🫘':'Beans','🥜':'Nuts','🍿':'Popcorn','🍪':'Cookie','🍩':'Donut','🧁':'Cupcake','🎂':'Cake','🍦':'Ice Cream','🍫':'Chocolate','🍬':'Candy','🍭':'Lollipop',
  '🍎':'Apple','🍐':'Pear','🍊':'Orange','🍋':'Lemon','🍌':'Banana','🍉':'Melon','🍇':'Grapes','🍓':'Strawberry','🫐':'Blueberry','🍒':'Cherry','🍑':'Peach','🥝':'Kiwi','🫒':'Olive','🥑':'Avocado',
  '💨':'Smoke','🌬️':'Wind','🍃':'Leaf','🫧':'Bubbles','🧿':'Nazar','🛋️':'Lounge','🪴':'Plant','🎵':'Music','🌙':'Moon','🌟':'Glow','🌆':'Twilight','✨':'Sparkle','🔥':'Fire','🌫️':'Fog',
  '🎮':'Games','🕹️':'Arcade','🎯':'Target','🎲':'Dice','🎳':'Bowling','🏓':'PingPong','🏸':'Badminton','♟️':'Chess','🧩':'Puzzle','🎪':'Circus','🎠':'Carousel','🎡':'Ferris','🎢':'Coaster','🎨':'Art','🎭':'Theater','🎤':'Mic','🎧':'Headphones','🥁':'Drum','🪁':'Kite','🪀':'Yo-yo','🧸':'Toy','🎱':'Billiards','📺':'TV','🖥️':'PC',
  '🌿':'Herb','🌸':'Flower','🌺':'Hibiscus','🌻':'Sunflower','🌴':'Palm','🌵':'Cactus','🍄':'Mushroom','🐚':'Shell','🪨':'Stone','🪵':'Wood','🏮':'Lantern','🕯️':'Candle','🪷':'Lotus','🧘':'Meditate',
  '🛒':'Cart','🛍️':'Bags','💳':'Card','💰':'Money','📋':'Clip','📝':'Notes','⏱️':'Timer','🔔':'Bell','📅':'Calendar','📍':'Pin','🔑':'Key','🖊️':'Pen','✂️':'Scissors','📦':'Box','🏷️':'Tag','⚙️':'Gear','🔧':'Wrench','🧹':'Clean','🧽':'Sponge',
  '🛵':'Scooter','🚲':'Bike','🚗':'Car','🚚':'Truck','🗺️':'Map',
  '🎉':'Party','🎊':'Confetti','🎈':'Balloon','🎁':'Gift','🏆':'Trophy','🥇':'Gold','🥈':'Silver','🥉':'Bronze','🎖️':'Medal',
  '☀️':'Sun','🌈':'Rainbow','💡':'Idea','📖':'Book','📷':'Camera','💜':'Purple','❤️':'Heart','💙':'Blue','💚':'Green','🖤':'Black','⭕':'Circle','🌀':'Ocean','💎':'Crystal','🌱':'Seedling','👀':'Eyes','🌛':'Crescent'
};
const COLOR_PRESETS=[
  {name:'Caf\u00e9 Classic',primary:'#6f4e37',accent:'#d4a574',bg:'#faf7f2',section:'#f5f0eb',icon:'☕',desc:'Warm browns & cream',dark:'#1c110a',medium:'#2a1a0f',muted:'#bda98e',border:'rgba(122,92,62,0.22)'},
  {name:'Coffee Roast',primary:'#4a3520',accent:'#c47e35',bg:'#f7efe3',section:'#efe3d3',icon:'☕',desc:'Rich dark coffee tones',dark:'#1c110a',medium:'#2a1a0f',muted:'#bda98e',border:'rgba(74,53,32,0.22)'},
  {name:'Soft Breeze',primary:'#7c9eb2',accent:'#b8d4e3',bg:'#f5f9fc',section:'#ebf2f7',icon:'\ud83c\udf43',desc:'Light airy pastels',dark:'#3a5068',medium:'#5a7a92',muted:'#a0bccf',border:'rgba(124,158,178,0.2)'},
  {name:'Blue Wave',primary:'#1a5f7a',accent:'#4a9bbf',bg:'#f0f7fa',section:'#e3eff5',icon:'\ud83c\udf0a',desc:'Deep ocean blues',dark:'#0d2f40',medium:'#154a60',muted:'#7ab5d0',border:'rgba(26,95,122,0.22)'},
  {name:'Midnight',primary:'#1a1a2e',accent:'#e94560',bg:'#16213e',section:'#0f3460',icon:'\ud83c\udf19',desc:'Dark & dramatic',dark:'#0a0a14',medium:'#12122a',muted:'#8888aa',border:'rgba(255,255,255,0.12)'},
  {name:'Forest',primary:'#2d5a27',accent:'#8fc27e',bg:'#f4f9f0',section:'#e8f0e0',icon:'\ud83c\udf3f',desc:'Natural greens',dark:'#132411',medium:'#1e3d1a',muted:'#8fa88a',border:'rgba(45,90,39,0.22)'},
  {name:'Sunset',primary:'#c96b3e',accent:'#f4a460',bg:'#fef6f0',section:'#faede3',icon:'\ud83c\udf05',desc:'Warm oranges',dark:'#3d1f10',medium:'#6a3820',muted:'#c49070',border:'rgba(201,107,62,0.22)'},
  {name:'Minimal',primary:'#333333',accent:'#666666',bg:'#ffffff',section:'#f5f5f5',icon:'\u26aa',desc:'Clean & simple',dark:'#111111',medium:'#222222',muted:'#999999',border:'rgba(0,0,0,0.12)'},
];

function LoginLogo({colors}){
  const {t,appName} = useLang();
  const ps = colors || {primary:'#6f4e37',accent:'#d4a574'};
  return <div style={{textAlign:'center',marginBottom:'0.75rem'}}>
    <div style={{width:64,height:64,borderRadius:'50%',background:ps.primary,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.5rem',fontSize:28,color:'#fff',boxShadow:'0 3px 10px rgba(0,0,0,0.15)'}}>☕</div>
    <div style={{fontFamily:'Georgia,serif',fontSize:22,fontStyle:'italic',letterSpacing:1,color:ps.primary,fontWeight:700}}>{appName}</div>
  </div>;
}

function POSPage(){
  const{t}=useLang();
  const[cats,setCats]=useState([]);const[menuItems,setMenuItems]=useState([]);const[allTables,setAllTables]=useState([]);
  const[tabs,setTabs]=useState(()=>{const s=draftDB.getAll();return s.length?s:[newDraft()];});
  const[activeTab,setActiveTab]=useState(0);const[selCat,setSelCat]=useState(null);
  const[showTypeModal,setShowTypeModal]=useState(false);const[showPay,setShowPay]=useState(false);
  const[showMobilePay,setShowMobilePay]=useState(false);const[qrCode,setQrCode]=useState(null);
  const[proofImg,setProofImg]=useState(null);const[proofVerified,setProofVerified]=useState(false);
  const[busy,setBusy]=useState(false);const[toast,setToast]=useState('');const[invoiceOrder,setInvoiceOrder]=useState(null);
  const[personInput,setPersonInput]=useState('');const[activePerson,setActivePerson]=useState(null);
  const[customers,setCustomers]=useState([]);const[custSearch,setCustSearch]=useState('');const[showCustDropdown,setShowCustDropdown]=useState(false);
  const[showPersonPay,setShowPersonPay]=useState(null);

  useEffect(()=>{loadData();api.settings.get('mobile_qr').then(r=>{if(r.value)setQrCode(r.value);}).catch(()=>{});loadCustomers();},[]);
  const loadCustomers=async(s)=>{try{const d=await api.customers.getAll(s||'');setCustomers(Array.isArray(d)?d:[]);}catch{}};
  useEffect(()=>{draftDB.saveAll(tabs);},[tabs]);

  const loadData=async()=>{try{const[c,i,tb]=await Promise.all([api.menu.getCategories(),api.menu.getItems(),api.tables.getAll()]);setCats((Array.isArray(c)?c:[]).filter(x=>x.name!=='Entertainment'));setMenuItems(Array.isArray(i)?i:[]);setAllTables(Array.isArray(tb)?tb:[]);}catch{}};

  const cur=tabs[activeTab]||tabs[0];
  const updateCur=patch=>setTabs(p=>p.map((t,i)=>i===activeTab?{...t,...patch}:t));

  const addToCart=(item,person=null)=>{
    const c=cur.cart,key=item.id+':'+(person||'');
    const ex=c.find(x=>x.id===item.id&&x.person===person);
    const nc=ex?c.map(x=>x.id===item.id&&x.person===person?{...x,qty:x.qty+1}:x):[...c,{id:item.id,name:item.name,price:item.price,qty:1,person}];
    updateCur({cart:nc});
  };
  const updateQty=(id,person,delta)=>updateCur({cart:cur.cart.map(c=>c.id===id&&c.person===person?{...c,qty:c.qty+delta}:c).filter(c=>c.qty>0)});
  const clearCur=()=>{updateCur({cart:[],discount:0,notes:'',orderType:null,selTable:'',openOrderId:null,persons:[]});setActivePerson(null);};
  const addNewTab=()=>{const nd=newDraft();setTabs(p=>[...p,nd]);setActiveTab(tabs.length);setSelCat(null);setActivePerson(null);};
  const closeTab=idx=>{if(tabs.length===1){clearCur();return;}setTabs(p=>p.filter((_,i)=>i!==idx));setActiveTab(Math.max(0,activeTab-(idx<=activeTab?1:0)));};

  const persons=cur.persons||[];
  const subtotal=cur.cart.reduce((s,i)=>s+i.price*i.qty,0);
  const total=Math.max(0,subtotal-cur.discount);
  const personTotals=useMemo(()=>{const m={};cur.cart.forEach(i=>{const k=i.person||'__shared';m[k]=(m[k]||0)+i.price*i.qty;});return m;},[cur.cart]);

  const placeOrder=async method=>{
    if(!cur.cart.length||!cur.orderType)return;setBusy(true);
    try{
      const payingPerson=showPersonPay&&showPersonPay!=='select'?showPersonPay:null;
      const personItems=payingPerson?cur.cart.filter(c=>c.person===payingPerson):cur.cart;
      const otherItems=payingPerson?cur.cart.filter(c=>c.person!==payingPerson):[];
      if(!personItems.length){setBusy(false);return;}
      let orderId,orderData;
      if(cur.openOrderId){
        // Add only items not already in the order (avoid duplicates)
        const existingOrder=await api.orders.getOne(cur.openOrderId);
        const existingKeys=new Set((existingOrder.items||[]).map(i=>i.menu_item_id+':'+(i.person_label||'')));
        const newCartItems=cur.cart.filter(c=>!existingKeys.has(c.id+':'+(c.person||'')));
        if(newCartItems.length)await api.orders.addItems(cur.openOrderId,newCartItems.map(c=>({menu_item_id:c.id,quantity:c.qty,person_label:c.person||null})));
        const fullOrder=await api.orders.getOne(cur.openOrderId);
        if(payingPerson){
          let persRec=(fullOrder.persons||[]).find(p=>p.label===payingPerson);
          if(!persRec)persRec=await api.orders.addPerson(cur.openOrderId,payingPerson);
          if(persRec)await api.orders.payPerson(cur.openOrderId,persRec.id,method);
          orderData=fullOrder;
          setInvoiceOrder(orderData);
          const newPaid=[...(cur.paidPersons||[]),payingPerson];
          const allPaid=persons.every(p=>newPaid.includes(p));
          if(allPaid){
            await api.orders.processPayment(cur.openOrderId,method);
            await api.orders.updateStatus(cur.openOrderId,'completed');
            closeTab(activeTab);setToast(t.orderDone);
          } else {
            const otherItems=cur.cart.filter(c=>c.person!==payingPerson);
            updateCur({cart:otherItems,openOrderId:cur.openOrderId,paidPersons:newPaid});
            setToast('\u2713 '+payingPerson+' paid');
          }
        }else{
          await api.orders.processPayment(cur.openOrderId,method);
          await api.orders.updateStatus(cur.openOrderId,'completed');
          setInvoiceOrder(fullOrder);
          closeTab(activeTab);setToast(t.orderDone);
        }
      }else{
        // Create new order with ALL cart items (not just paying person's items)
        const allItems=cur.cart.map(c=>({menu_item_id:c.id,quantity:c.qty,person_label:c.person||null}));
        const r=await api.orders.create({order_type:cur.orderType,table_id:cur.orderType==='dine-in'&&cur.selTable?Number(cur.selTable):null,items:allItems,notes:cur.notes,discount:cur.discount,persons:persons.map(p=>({label:p}))});
        orderId=r.id;
        if(payingPerson){
          const fullOrder=await api.orders.getOne(orderId);
          let persRec=(fullOrder.persons||[]).find(p=>p.label===payingPerson);
          if(!persRec)persRec=await api.orders.addPerson(orderId,payingPerson);
          if(persRec)await api.orders.payPerson(orderId,persRec.id,method);
          orderData=fullOrder;
          setInvoiceOrder(orderData);
          const newPaid=[...(cur.paidPersons||[]),payingPerson];
          const allPaid=persons.every(p=>newPaid.includes(p));
          if(allPaid){
            await api.orders.processPayment(orderId,method);
            await api.orders.updateStatus(orderId,'completed');
            closeTab(activeTab);setToast(t.orderDone);
          } else {
            const otherItems=cur.cart.filter(c=>c.person!==payingPerson);
            updateCur({cart:otherItems,openOrderId:orderId,paidPersons:newPaid});
            setToast('\u2713 '+payingPerson+' paid \u2014 remaining: $'+otherItems.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2));
          }
        }else{
          await api.orders.processPayment(orderId,method);
          await api.orders.updateStatus(orderId,'completed');
          orderData=await api.orders.getOne(orderId);
          setInvoiceOrder(orderData);
          closeTab(activeTab);setToast(t.orderDone);
        }
      }
      setShowPay(false);setShowPersonPay(null);setShowMobilePay(false);setProofImg(null);setProofVerified(false);loadData();
    }catch(ex){alert(ex.message);}finally{setBusy(false);}
  };;

  const openTab=async()=>{
    if(!cur.cart.length||cur.orderType!=='dine-in')return;setBusy(true);
    try{
      const items=cur.cart.map(c=>({menu_item_id:c.id,quantity:c.qty,person_label:c.person||null}));
      const r=await api.orders.create({order_type:'dine-in',table_id:cur.selTable?Number(cur.selTable):null,items,notes:cur.notes,discount:cur.discount,persons:persons.map(p=>({label:p}))});
      await api.orders.updateStatus(r.id,'preparing');
      updateCur({cart:[],openOrderId:r.id});setToast('✓ Tab opened!');setActivePerson(null);loadData();
    }catch(ex){alert(ex.message);}finally{setBusy(false);}
  };

  const diningTables=allTables.filter(tb=>tb.type==='table'&&tb.status==='available');
  const filteredItems=selCat?menuItems.filter(i=>i.category_id===selCat&&i.is_available&&(!i.track_stock||i.stock_quantity>0)):[];

  return(<div className="pos-wrap">
    {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    {invoiceOrder&&<InvoiceModal order={invoiceOrder} onClose={()=>setInvoiceOrder(null)}/>}
    {showTypeModal&&(<div className="modal-bg" onClick={()=>setShowTypeModal(false)}><div className="ot-modal" onClick={e=>e.stopPropagation()}>
      <h2>{t.selectOrderType}</h2><div className="ot-choices">
        {[['takeaway','🛍️',t.takeaway],['dine-in','🪑',t.dineIn]].map(([v,ico,lbl])=><button key={v} className={`ot-btn${cur.orderType===v?' selected':''}`} onClick={()=>{updateCur({orderType:v});setShowTypeModal(false);}}><span className="ot-icon">{ico}</span>{lbl}</button>)}
      </div></div></div>)}

    {showMobilePay&&(<div className="modal-bg" onClick={()=>setShowMobilePay(false)}><div className="mobile-pay-modal" onClick={e=>e.stopPropagation()}>
      <h3>📱 WISH Money Payment</h3>
      <div className="wish-amount">${showPersonPay&&showPersonPay!=='select'?(personTotals[showPersonPay]||0).toFixed(2):total.toFixed(2)}</div>
      <p className="wish-hint">Ask the customer to scan with WISH Money and enter the amount above manually (WISH QR does not pre-fill amounts)</p>
      {qrCode?<img src={qrCode} alt="WISH Money QR" className="qr-display"/>:<div className="qr-placeholder">⚠️ No QR configured.<br/>Go to Accounting → Mobile Pay QR to upload your WISH Money QR code.</div>}
      <div style={{marginTop:'1.25rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
        <button className="btn-primary btn-full" style={{background:'var(--green)',fontSize:'1rem',padding:'0.75rem'}} onClick={()=>placeOrder('mobile')} disabled={busy}>
          ✓ Payment Received — Complete Order
        </button>
        <button className="btn-ghost btn-full" onClick={()=>setShowMobilePay(false)}>{t.cancel}</button>
      </div>
    </div></div>)}

    <div className="pos-left">
      <div className="order-tabs">
        {tabs.map((tab,idx)=><div key={tab.draftId} className={`order-tab${idx===activeTab?' active':''}`} onClick={()=>{setActiveTab(idx);setSelCat(null);setActivePerson(null);}}>
          <span>{t.tabLabel} {idx+1}{tab.openOrderId?' 📌':''}</span>
          {tabs.length>1&&<button className="tab-close" onClick={e=>{e.stopPropagation();const t=tabs[idx];if(t.cart.length>0){alert('Please process or clear the order before closing this tab.');return;}closeTab(idx);}}>×</button>}
        </div>)}
        <button className="order-tab new-tab-btn" onClick={addNewTab}>{t.newTab}</button>
      </div>

      {!cur.orderType?(
        <div className="pos-start"><span className="pos-start-emo">☕</span><h2>{t.selectOrderType}</h2>
          <div className="ot-choices">{[['takeaway','🛍️',t.takeaway],['dine-in','🪑',t.dineIn]].map(([v,ico,lbl])=><button key={v} className="ot-btn" onClick={()=>updateCur({orderType:v})}><span className="ot-icon">{ico}</span>{lbl}</button>)}</div>
        </div>
      ):(
        <>
          <div className="pos-topbar">
            <button className="pill-ot" onClick={()=>setShowTypeModal(true)}>{cur.orderType==='takeaway'?'🛍️':'🪑'} {cur.orderType==='takeaway'?t.takeaway:t.dineIn}<span className="pill-arr">▾</span></button>
            {selCat&&<button className="btn-back-cat" onClick={()=>setSelCat(null)}>← {t.backToMenu}</button>}
            {cur.openOrderId&&<span className="open-tab-badge">📌 Tab #{cur.openOrderId}</span>}
            {persons.length>0&&<div className="person-tabs">{persons.map(p=><button key={p} className={`person-tab-btn${activePerson===p?' active':''}`} onClick={()=>setActivePerson(activePerson===p?null:p)}>{p}</button>)}</div>}
          </div>
          {!selCat?(<div className="cat-grid">{cats.map(cat=><div key={cat.id} className="cat-card" onClick={()=>setSelCat(cat.id)}><span className="cat-emo">{getCatIcon(cat)}</span><span className="cat-name">{cat.name}</span><span className="cat-count">{menuItems.filter(i=>i.category_id===cat.id&&i.is_available).length} items</span></div>)}</div>
          ):(<div className="item-grid">{filteredItems.map(item=><div key={item.id} className={`item-card${item.track_stock&&!item.stock_quantity?' item-disabled':''}`} onClick={()=>{if(item.track_stock&&!item.stock_quantity)return;addToCart(item,activePerson);}}>
            <span className="item-name">{item.name}</span><span className="item-price">${parseFloat(item.price).toFixed(2)}</span>{item.track_stock?<span className={`item-stock ${item.stock_quantity>0?'':'item-out'}`}>{item.stock_quantity>0?item.stock_quantity+' left':'OUT'}</span>:null}{item.preparation_time>0&&<span className="item-time">⏱ {item.preparation_time}m</span>}
          </div>)}</div>)}
        </>
      )}
    </div>

    <div className="pos-cart">
      <div className="cart-hd"><h3>{t.currentOrder}</h3>{cur.cart.length>0&&<span className="cart-badge">{cur.cart.reduce((s,i)=>s+i.qty,0)}</span>}</div>
      {cur.orderType==='dine-in'&&!cur.openOrderId&&<div className="field"><label>🪑 {t.table}</label><select value={cur.selTable} onChange={e=>updateCur({selTable:e.target.value})}><option value="">{t.chooseTable}</option>{diningTables.map(tb=><option key={tb.id} value={tb.id}>Table {tb.number} ({tb.seats}p)</option>)}</select></div>}

      {!cur.openOrderId&&<><div style={{fontSize:'0.72rem',fontWeight:600,color:'var(--oat)',marginBottom:'0.2rem',textTransform:'uppercase',letterSpacing:'0.03em'}}>PERSONS</div><div className="split-input-row" style={{position:'relative'}}>
        <input className="person-add-inp" placeholder={t.personLabel||'Person name…'} value={personInput} onChange={e=>{setPersonInput(e.target.value);setShowCustDropdown(true);loadCustomers(e.target.value);}}
          onKeyDown={e=>{if(e.key==='Enter'&&personInput.trim()){updateCur({persons:[...persons,personInput.trim()]});setPersonInput('');setShowCustDropdown(false);}}}/>
        <button className="btn-sm" onClick={()=>{if(personInput.trim()){updateCur({persons:[...persons,personInput.trim()]});setPersonInput('');setShowCustDropdown(false);}}}>{t.addPerson||'+ Person'}</button>
        {showCustDropdown&&customers.length>0&&<div className="customer-dropdown" style={{position:'absolute',top:'100%',left:0,right:0,zIndex:50}}>
          <div className="customer-list">{customers.slice(0,8).map(c=><div key={c.id} className={`cust-item${persons.includes(c.name)?' cust-selected':''}`} onClick={()=>{if(!persons.includes(c.name)){updateCur({persons:[...persons,c.name]});}setPersonInput('');setShowCustDropdown(false);}}>
            <span className="cust-name">{c.name}</span>{c.phone&&<span className="cust-phone">{c.phone}</span>}
          </div>)}</div>
        </div>}
      </div></>}

      {persons.length>0&&<div className="persons-strip">{persons.map(p=>{
        const pTot=personTotals[p]||0;
        const isPaid=(cur.paidPersons||[]).includes(p);
        return(<div key={p} className={`person-chip${activePerson===p?' active':''}${isPaid?' paid':''}`} onClick={()=>{if(!isPaid)setActivePerson(activePerson===p?null:p);}}>
          {isPaid?'✅ ':'👤 '}{p}<span className="person-chip-amt">${pTot.toFixed(2)}</span>
          
          {isPaid&&<span className="person-chip-paid-badge" style={{fontSize:'0.65rem',color:'var(--green)',fontWeight:600}}>PAID</span>}<button className="person-chip-remove" onClick={e=>{e.stopPropagation();const newP=persons.filter(x=>x!==p);const keptCart=cur.cart.filter(i=>i.person!==p);updateCur({persons:newP,cart:keptCart});}} title="Remove" style={{fontSize:'0.6rem',background:'none',border:'none',color:'var(--red)',cursor:'pointer',marginLeft:'2px',padding:'0 2px 0 4px',opacity:0.6}}>✕</button>
        </div>);
      })}</div>}
      <div className="cart-list">
                {!cur.cart.length?<div className="cart-empty">🛒<br/>{t.noItems}</div>
                :(()=>{
                  const groups={};
                  cur.cart.forEach(item=>{
                    const key=item.person||'__unassigned';
                    if(!groups[key])groups[key]={label:key,items:[]};
                    groups[key].items.push(item);
                  });
                  const sorted=Object.entries(groups).sort(([a],[b])=>{
                    if(a==='__unassigned')return 1;if(b==='__unassigned')return -1;
                    return a.localeCompare(b);
                  });
                  return <div className="cart-person-groups">{sorted.map(([key,grp])=><div key={key} className="cart-person-group">
                    {key!=='__unassigned'&&<div className="cart-person-header">{(cur.paidPersons||[]).includes(key)?'✅ ':'👤 '}{key}<span className="cart-person-total">${grp.items.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2)}</span></div>}
                    {grp.items.map((item,idx)=><div key={idx} className="cart-row">
                      <span className="cr-name">{item.name}</span>
                      <div className="cr-ctrl"><button onClick={()=>updateQty(item.id,item.person,-1)}>−</button><span>{item.qty}</span><button onClick={()=>updateQty(item.id,item.person,1)}>+</button></div>
                      <span className="cr-price">${(item.price*item.qty).toFixed(2)}</span>
                    </div>)}
                  {key!=='__unassigned'&&((cur.paidPersons||[]).includes(key)
?<div className="person-group-paid" style={{textAlign:'right',fontSize:'0.72rem',color:'var(--green)',padding:'0.2rem 0.5rem',fontWeight:600,background:'rgba(34,197,94,0.08)',borderRadius:'0 0 6px 6px',marginBottom:'0.35rem'}}>PAID</div>
:<div className="person-group-pay" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.3rem 0.5rem',background:'rgba(111,78,55,0.06)',borderRadius:'0 0 6px 6px',marginBottom:'0.35rem'}}>
<span style={{fontSize:'0.75rem',color:'var(--oat)'}}>Total: <strong>{grp.items.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2)}</strong></span>
<button className="btn-sm" style={{background:'var(--caramel)',color:'#fff',border:'none',padding:'0.25rem 0.7rem',borderRadius:'4px',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}} onClick={()=>{setActivePerson(key);setShowPersonPay(key);setShowPay(true);}}>Pay Now</button>
</div>)
}
</div>)}
                </div>;
                })()
              }
              </div>
      <div className="cart-summary">
        <div className="cs-row"><span>{t.subtotal}</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="cs-row"><span>{t.discount}</span><input className="disc-inp" type="number" value={cur.discount} onChange={e=>updateCur({discount:Number(e.target.value)})} min="0" step="0.5"/></div>
        <div className="cs-row cs-total"><span>{t.total}</span><span>${total.toFixed(2)}</span></div>
      </div>

      <div className="field"><label>{t.notes}</label><textarea value={cur.notes} onChange={e=>updateCur({notes:e.target.value})} placeholder={t.notesPlh} rows={2}/></div>
      <div className="cart-actions">
        <button className="btn-ghost" onClick={clearCur}>🗑 {t.clear}</button>
        <button className="btn-dispatch" onClick={()=>{const order={order_type:cur.orderType,table_number:cur.selTable,items:cur.cart.map(c=>({name:c.name,item_name:c.name,quantity:c.qty,person_label:c.person})),notes:cur.notes};printWin(buildDispatchHTML(order,'en',{dineIn:'Dine In',takeaway:'Takeaway'}));}} disabled={!cur.cart.length}>📋 {t.dispatch}</button>
        <button className="btn-primary cart-pay-btn" onClick={()=>{if(persons.length>0&&!activePerson&&!persons.every(p=>(cur.paidPersons||[]).includes(p))){setShowPersonPay('select');setShowPay(true);}else{setShowPay(true);}}} disabled={!cur.cart.length||!cur.orderType||busy||(persons.length>0&&persons.every(p=>(cur.paidPersons||[]).includes(p)))}>{persons.length>0&&persons.every(p=>(cur.paidPersons||[]).includes(p))?'✅ All Paid':'💳 '+t.pay+' $'+total.toFixed(2)}</button>
      </div>
      {showPay&&(<div className="pay-drawer">
        {showPersonPay&&showPersonPay!=='select'?(
          <>
            <h4>💳 Pay <strong>{showPersonPay}</strong> — ${(personTotals[showPersonPay]||0).toFixed(2)}</h4>
            <p style={{fontSize:'0.75rem',color:'var(--oat)',marginBottom:'0.6rem'}}>Collect payment for this person's items. The total will be reduced.</p>
            <div className="pay-opts">
              <button className="pay-opt" onClick={()=>placeOrder('cash')} disabled={busy}>💵<span>{t.cash}</span></button>
              <button className="pay-opt" onClick={()=>{setShowPay(false);setShowMobilePay(true);}} disabled={busy}>📱<span>{t.mobile}</span></button>
            </div>
            <button className="btn-ghost btn-full" onClick={()=>{setShowPay(false);setShowPersonPay(null);}}>{t.cancel}</button>
          </>
        ):(
          <>
            <h4>{t.selectPayment}</h4>
            <div className="pay-opts">
              <button className="pay-opt" onClick={()=>placeOrder('cash')} disabled={busy}>💵<span>{t.cash}</span></button>
              <button className="pay-opt" onClick={()=>{setShowPay(false);setShowMobilePay(true);}} disabled={busy}>📱<span>{t.mobile}</span></button>
            </div>
            <button className="btn-ghost btn-full" onClick={()=>setShowPay(false)}>{t.cancel}</button>
          </>
        )}
      </div>)}
    </div>
  </div>);
}

function OrdersPage(){
  const{t,lang,appName}=useLang();const emp=JSON.parse(localStorage.getItem('employee')||'{}');
  const[orders,setOrders]=useState([]);const[filter,setFilter]=useState({status:'',order_type:'',date_from:'',date_to:''});
  const[datePreset,setDatePreset]=useState('');
  const todayStr=()=>new Date().toISOString().split('T')[0];
  const presets=[
    {key:'today',label:'Today',from:()=>todayStr(),to:()=>todayStr()},
    {key:'yesterday',label:'Yesterday',from:()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().split('T')[0];},to:()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().split('T')[0];}},
    {key:'week',label:'This Week',from:()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());return d.toISOString().split('T')[0];},to:()=>todayStr()},
    ,

  ];
  const applyPreset=preset=>{
    setDatePreset(preset.key);
    setFilter(f=>({...f,date_from:preset.from(),date_to:preset.to()}));
  };
  const[sel,setSel]=useState(null);const[invoiceOrder,setInvoiceOrder]=useState(null);
  const[showPay,setShowPay]=useState(false);const[showPersonPay,setShowPersonPay]=useState(null);
  useEffect(()=>{load();},[filter]);
  const load=async()=>{try{const d=await api.orders.getAll(Object.fromEntries(Object.entries(filter).filter(([,v])=>v)));setOrders(Array.isArray(d)?d:[]);}catch{}};
  const view=async id=>{try{setSel(await api.orders.getOne(id));}catch{}};
  const setStatus=async(id,s)=>{if(!can(emp.role,'orders_status'))return;await api.orders.updateStatus(id,s);load();if(sel?.id===id)view(id);};
  const payOrder=async m=>{if(!sel)return;await api.orders.processPayment(sel.id,m);await api.orders.updateStatus(sel.id,'completed');setShowPay(false);const u=await api.orders.getOne(sel.id);setSel(u);setInvoiceOrder(u);load();};
  const payPerson=async(pid,m)=>{try{await api.orders.payPerson(sel.id,pid,m);const u=await api.orders.getOne(sel.id);setSel(u);setShowPersonPay(null);load();}catch(ex){alert(ex.message);}};
  const SC={pending:'#f59e0b',preparing:'#3b82f6',ready:'#22c55e',completed:'#6b7280',cancelled:'#ef4444'};
  const SL={pending:t.pending,preparing:t.preparing,ready:t.ready,completed:t.completed,cancelled:t.cancelled};
  return(<div className="page">
    {invoiceOrder&&<InvoiceModal order={invoiceOrder} onClose={()=>setInvoiceOrder(null)}/>}
    <div className="page-hd"><h2>📋 {t.orders}</h2></div>
    <div className="orders-filter-card">
      <div className="of-row-top">
        <div className="of-filters">
          <div className="of-select-group">
            <span className="of-label">Status</span>
            <select value={filter.status} onChange={e=>setFilter({...filter,status:e.target.value})}>
              <option value="">{t.allStatuses}</option>
              {Object.keys(SL).map(s=><option key={s} value={s}>{SL[s]}</option>)}
            </select>
          </div>
          <div className="of-select-group">
            <span className="of-label">Type</span>
            <select value={filter.order_type} onChange={e=>setFilter({...filter,order_type:e.target.value})}>
              <option value="">{t.allTypes}</option>
              <option value="takeaway">{t.takeaway}</option>
              <option value="dine-in">{t.dineIn}</option>
            </select>
          </div>
        </div>
        <div className="of-date-section">
          <div className="of-presets">
            {presets.map(p=><button key={p.key} className={`of-preset-btn${datePreset===p.key?' active':''}`} onClick={()=>applyPreset(p)}>{p.label}</button>)}
          </div>
                    <div className="of-range-picker">
            <div className="of-date-box">
              <span className="of-range-label">{t.fromDate}</span>
              <div className="of-date-input-wrap">
                <span className="of-cal-icon">📅</span>
                <input type="date" className="of-date-input" value={filter.date_from||''} onChange={e=>{setDatePreset('');setFilter({...filter,date_from:e.target.value})}} />
              </div>
            </div>
            <span className="of-range-sep">→</span>
            <div className="of-date-box">
              <span className="of-range-label">{t.toDate}</span>
              <div className="of-date-input-wrap">
                <span className="of-cal-icon">📅</span>
                <input type="date" className="of-date-input" value={filter.date_to||''} onChange={e=>{setDatePreset('');setFilter({...filter,date_to:e.target.value})}} />
              </div>
            </div>
            {(filter.date_from||filter.date_to)&&<button className="of-clear-date" onClick={()=>{setDatePreset('');setFilter({...filter,date_from:'',date_to:''})}} title="Clear range">✕</button>}
          </div>
          <button className="of-print-btn" onClick={async()=>{
            try{
              const from=filter.date_from||new Date(new Date().setFullYear(new Date().getFullYear()-1)).toISOString().split('T')[0];
              const to=filter.date_to||todayStr();
              const data=await api.reports.getRange(from,to);
              const label=filter.date_from&&filter.date_to?filter.date_from+' → '+filter.date_to:'';
              printWin(buildReportHTML(data,label||'Orders Report',lang,{...t,appName}));
            }catch(ex){alert('Failed to load report data');}
          }} title={t.printReport}>🖨️ {t.printReport}</button>
        </div>
      </div>
    </div>
    <div className="orders-grid">
      <div className="orders-col">
        {!orders.length&&<p className="muted">No orders</p>}
        {orders.map(o=><div key={o.id} className={`order-card${sel?.id===o.id?' selected':''}`} onClick={()=>view(o.id)}>
          <div className="oc-top"><strong>{o.invoice_formatted||fmtInv(o.invoice_number||o.id)}</strong><span className="type-badge">{o.order_type==='dine-in'?'🪑':'🛍️'} {o.order_type==='dine-in'?t.dineIn:t.takeaway}</span></div>
          <div className="oc-mid">{o.table_number?`T${o.table_number} · `:''}{new Date(o.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
          <div className="oc-bot"><span className="status-chip" style={{background:SC[o.status]+'22',color:SC[o.status],border:`1px solid ${SC[o.status]}44`}}>{SL[o.status]}</span><span className={`pay-chip ${o.payment_status==='paid'?'pay-paid':'pay-unpaid'}`}>{o.payment_status==='paid'?t.paid:t.unpaid}</span><strong>${parseFloat(o.total).toFixed(2)}</strong></div>
        </div>)}
      </div>
      {sel&&(<div className="detail-col">
        <div className="detail-hd"><h3>{sel.invoice_formatted||fmtInv(sel.invoice_number||sel.id)}</h3>
          <div style={{display:'flex',gap:'0.35rem'}}>
            <button className="btn-sm" onClick={()=>setInvoiceOrder(sel)} title="Print Invoice">🖨️</button>
            <button className="btn-sm" onClick={()=>printWin(buildDispatchHTML(sel,lang,t))} title="Print Dispatch">📋</button>
            <button className="btn-xs-ghost" onClick={()=>setSel(null)}>✕</button>
          </div>
        </div>
        {[[t.table||'Type',sel.order_type==='dine-in'?t.dineIn:t.takeaway],sel.table_number&&[t.table,`Table ${sel.table_number}`],[t.employee,sel.employee_name||'-'],
          ['Status',<span className="status-chip" style={{background:SC[sel.status]+'22',color:SC[sel.status]}}>{SL[sel.status]}</span>],
          [t.paymentStatus,<span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}><span className={`pay-chip ${sel.payment_status==='paid'?'pay-paid':'pay-unpaid'}`}>{sel.payment_status==='paid'?t.paid:t.unpaid}</span><button className="btn-xs-ghost" onClick={async()=>{if(sel.payment_status==='paid'){try{await api.orders.markUnpaid(sel.id);}catch{}window.location.reload();}else{await api.orders.markPaid(sel.id,'cash');}load();view(sel.id);}} title={sel.payment_status==='paid'?'↩ Mark Unpaid':'✓ Mark Paid'} style={{fontSize:'0.65rem',cursor:'pointer',background:'none',border:'1px solid var(--border)',borderRadius:'3px',padding:'1px 5px',color:'var(--oat)'}}>{sel.payment_status==='paid'?'↩ Unpaid':'✓ Paid'}</button></span>]
        ].filter(Boolean).map(([k,v],i)=><div key={i} className="det-row"><span>{k}</span><span>{v}</span></div>)}
        <div className="det-items">{(sel.items||[]).map((it,i)=><div key={i} className="det-item-row"><span>{it.name||it.item_name}{it.person_label&&<span style={{color:'var(--oat)',fontSize:'0.7rem'}}> [{it.person_label}]</span>} ×{it.quantity}</span><span>${(parseFloat(it.unit_price||0)*it.quantity).toFixed(2)}</span></div>)}</div>
        {sel.discount>0&&<div className="det-row"><span>{t.discount}</span><span>-${parseFloat(sel.discount).toFixed(2)}</span></div>}
        <div className="det-row det-total"><span>{t.total}</span><span>${parseFloat(sel.total).toFixed(2)}</span></div>

        {(sel.persons||[]).length>0&&<div style={{marginTop:'0.75rem'}}>
          <div className="split-bill-header">👥 {t.splitBill||'Split Bill'}</div>
          {sel.persons.map(p=>{
            const pItems=(sel.items||[]).filter(i=>i.person_label===p.label);
            const pTotal=pItems.reduce((s,i)=>s+(parseFloat(i.unit_price||0)*i.quantity),0);
            return(<div key={p.id} className={`person-bill-row${p.paid?' person-paid':''}`}>
              <div className="person-bill-left">
                <div className="person-bill-name">{p.label}{p.paid&&<span className="person-paid-badge">✓ Paid</span>}</div>
                <div className="person-bill-items">{pItems.length?pItems.map((i,idx)=><span key={idx}>{i.name||i.item_name} ×{i.quantity}{idx<pItems.length-1?', ':''}</span>):<span>No items assigned</span>}</div>
              </div>
              <div className="person-bill-right">
                <div className="person-bill-total" style={{color:p.paid?'var(--green)':'var(--caramel-l)'}}>${pTotal.toFixed(2)}</div>
                {!p.paid&&(showPersonPay===p.id
                  ?<div className="person-pay-methods">{[['cash','💵 Cash'],['mobile','📱 Mobile']].map(([m,lbl])=><button key={m} className="btn-person-pay" onClick={()=>payPerson(p.id,m)}>{lbl}</button>)}<button className="btn-xs-ghost" onClick={()=>setShowPersonPay(null)}>✕</button></div>
                  :<button className="btn-pay-person" onClick={()=>setShowPersonPay(p.id)}>💳 Collect ${pTotal.toFixed(2)}</button>
                )}
              </div>
            </div>);
          })}
          {sel.persons.length>0&&<div className="split-remaining"><span>Remaining:</span><strong>${parseFloat(sel.total).toFixed(2)}</strong></div>}
        </div>}

        {sel.payment_status!=='paid'&&!(sel.persons||[]).length&&(!showPay
          ?<button className="btn-primary btn-full mt-sm" onClick={()=>setShowPay(true)}>💳 {t.closeBill}</button>
          :<div className="inline-pay"><p style={{fontSize:'0.8rem',color:'var(--oat)',marginBottom:'0.5rem'}}>{t.selectPayment}</p><div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>{[['cash','💵',t.cash],['mobile','📱',t.mobile]].map(([m,ico,lbl])=><button key={m} className="btn-sm" onClick={()=>payOrder(m)}>{ico} {lbl}</button>)}</div><button className="btn-ghost btn-full mt-xs" onClick={()=>setShowPay(false)}>{t.cancel}</button></div>
        )}
        <button className="btn-dispatch btn-full mt-sm" onClick={()=>printWin(buildDispatchHTML(sel,lang,{dineIn:'Dine In',takeaway:'Takeaway'}))}>📋 Print Dispatch</button>
        {can(emp.role,'orders_status')&&<div className="status-btns">{Object.keys(SL).filter(s=>s!==sel.status).map(s=><button key={s} className="btn-status" style={{borderColor:SC[s],color:SC[s]}} onClick={()=>setStatus(sel.id,s)}>{SL[s]}</button>)}</div>}
      </div>)}
    </div>
  </div>);
}

function GamingPage(){
  const{t}=useLang();
  const[menuItems,setMenuItems]=useState([]);const[stations,setStations]=useState([]);
  const[activeSess,setActiveSess]=useState(()=>gamingDB.get());
  const[elapsed,setElapsed]=useState('00:00:00');
  const[gtabs,setGtabs]=useState(()=>JSON.parse(localStorage.getItem('cafe_gaming_tabs')||'null')||[{tabId:Date.now(),stationId:null,stationLabel:'',cart:[]}]);
  const[activeGTab,setActiveGTab]=useState(0);
  const[showPay,setShowPay]=useState(false);const[busy,setBusy]=useState(false);const[invoiceOrder,setInvoiceOrder]=useState(null);
  const[gamingToast,setGamingToast]=useState('');
  const timerRef=useRef(null);
  const lastNotifiedHour=useRef(0);

  useEffect(()=>{load();if(activeSess?.start)startTimer(activeSess.start,activeSess.label);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[]);
  useEffect(()=>{localStorage.setItem('cafe_gaming_tabs',JSON.stringify(gtabs));},[gtabs]);
  useEffect(()=>{if(activeSess)gamingDB.set(activeSess);else gamingDB.clear();},[activeSess]);

  const endAllSessions=async()=>{try{const r=await apiFetch('POST','/tables/gaming-sessions/end-all');lastNotifiedHour.current=0;if(timerRef.current)clearInterval(timerRef.current);setElapsed('00:00:00');setActiveSess(null);gamingDB.clear();setGtabs(p=>p.map(t=>({...t,session:null,stationId:null,stationLabel:''})));load();alert(r.message);}catch(ex){alert(ex.message);}};

  const load=async()=>{try{const[items,tbs]=await Promise.all([api.menu.getItems(),api.tables.getAll()]);setMenuItems((Array.isArray(items)?items:[]).filter(i=>i.is_available));const stns=(Array.isArray(tbs)?tbs:[]).filter(tb=>tb.type!=='table');setStations(stns);if(activeSess){const stn=stns.find(s=>s.id===activeSess.tableId);if(stn&&stn.status!=='occupied'){setActiveSess(null);gamingDB.clear();if(timerRef.current)clearInterval(timerRef.current);setElapsed('00:00:00');}}}catch{}};

  const startTimer=(start, label)=>{
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      const d=Math.floor((Date.now()-new Date(start).getTime())/1000);
      if(d<0)return;
      const h=Math.floor(d/3600),m=Math.floor((d%3600)/60),s=d%60;
      if(h>0&&h>lastNotifiedHour.current){lastNotifiedHour.current=h;setGamingToast(`⏱ ${h}h elapsed on ${label}`);}
      setElapsed(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    },1000);
  };

  const curGTab=gtabs[activeGTab]||gtabs[0];
  const updateGTab=patch=>setGtabs(p=>p.map((t,i)=>i===activeGTab?{...t,...patch}:t));

  const startSess=async tb=>{
    // Allow sessions across different tabs - check if this station is in use elsewhere
const alreadyInUse=gtabs.some((g,i)=>i!==activeGTab&&g.stationId===tb.id);
if(alreadyInUse)return alert('This station is already in use in another tab.');
    try{
      const r=await api.tables.startSession(tb.id);
      const ss=r.session_start||new Date().toISOString();
      lastNotifiedHour.current=0;const sess={tableId:tb.id,label:`${tb.type.charAt(0).toUpperCase()+tb.type.slice(1)} ${tb.number}`,start:ss,rate:tb.hourly_rate};
      updateGTab({stationId:tb.id,stationLabel:sess.label,session:sess});
      setActiveSess(sess);
      startTimer(ss,sess.label);
      load();
    }catch(ex){alert(ex.message);}
  };

  const endSess=async()=>{
    const sess=curGTab.session||activeSess;
    if(!sess)return;
    setBusy(true);
    try{
      const r=await api.tables.endSession(sess.tableId);
      const sessItem=r.charge>0?[{id:'sess_'+sess.tableId,name:`${sess.label} Session (${r.elapsed_hours}h)`,price:r.charge,qty:1,isSession:true}]:[];
      updateGTab({cart:[...curGTab.cart,...sessItem],session:null,stationId:null,stationLabel:''});
      lastNotifiedHour.current=0;const otherTabSession=gtabs.some((g,i)=>i!==activeGTab&&g.session);
      if(!otherTabSession){if(timerRef.current)clearInterval(timerRef.current);setElapsed('00:00:00');setActiveSess(null);gamingDB.clear();}
      load();
    }catch(ex){alert(ex.message);}finally{setBusy(false);}
  };

  const addItem=item=>updateGTab({cart:curGTab.cart.find(c=>c.id===item.id&&!c.isSession)?curGTab.cart.map(c=>c.id===item.id&&!c.isSession?{...c,qty:c.qty+1}:c):[...curGTab.cart,{id:item.id,name:item.name,price:item.price,qty:1}]});
  const removeItem=id=>updateGTab({cart:curGTab.cart.filter(c=>c.id!==id)});
  const total=curGTab.cart.reduce((s,i)=>s+i.price*i.qty,0);

  const addNewGTab=()=>{setGtabs(p=>[...p,{tabId:Date.now(),stationId:null,stationLabel:'',cart:[]}]);setActiveGTab(gtabs.length);};
  const closeGTab=idx=>{if(gtabs.length===1)return;setGtabs(p=>p.filter((_,i)=>i!==idx));setActiveGTab(Math.max(0,activeGTab-(idx<=activeGTab?1:0)));};

  const placeOrder=async method=>{if(!curGTab.cart.length)return;setBusy(true);
    try{const realItems=curGTab.cart.filter(c=>!c.isSession);
      const sessItems=curGTab.cart.filter(c=>c.isSession);
      // Handle session time charges as a proper order with entertainment category item
      if(sessItems.length>0){
        const entCat=await api.menu.getCategories().then(cats=>cats.find(c=>c.name==='Entertainment'));
        if(entCat){
          // Try to find or create a matching menu item for this session
          const existingItems=await api.menu.getItems();
          for(const si of sessItems){
            let menuItem=existingItems.find(mi=>mi.name===si.name);
            if(!menuItem){
              // Create the session item if it doesn't exist
              menuItem=await api.menu.createItem({name:si.name,price:0,category_id:entCat.id,description:'Auto-created gaming session charge',preparation_time:0});
            }
            realItems.push({menu_item_id:menuItem.id,quantity:si.qty,unit_price:si.price});
          }
        }
      }
      if(realItems.length){
        const r=await api.orders.create({order_type:'takeaway',items:realItems.map(i=>({menu_item_id:i.menu_item_id||i.id,quantity:i.quantity||i.qty,unit_price:i.unit_price})),notes:`Gaming - ${curGTab.stationLabel||''}`,discount:0,payment_method:method});
        await api.orders.updateStatus(r.id,'completed');
        const inv=await api.orders.getOne(r.id);
        setInvoiceOrder(inv);
      }
    setShowPay(false);load();}catch(ex){alert(ex.message);}finally{setBusy(false);}};

  const SI={playstation:'🎮',pc:'🖥',billiards:'🎱',babyfoot:'⚽'};

  return(<div className="gaming-wrap">
    {invoiceOrder&&<InvoiceModal order={invoiceOrder} onClose={()=>{setInvoiceOrder(null);updateGTab({cart:[]});closeGTab(activeGTab);}}/>}
    {gamingToast&&<Toast msg={gamingToast} onDone={()=>setGamingToast('')}/>}
    <div className="gaming-left">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
        <h2 className="page-title">🎮 {t.gaming}</h2>
        <div className="order-tabs" style={{background:'none',border:'none',padding:0}}>
          {gtabs.map((tab,idx)=><div key={tab.tabId} className={`order-tab${idx===activeGTab?' active':''}`} onClick={()=>setActiveGTab(idx)}>
            <span>{tab.stationLabel||`Station ${idx+1}`}</span>
            {gtabs.length>1&&<button className="tab-close" onClick={e=>{e.stopPropagation();const t=gtabs[idx];if(t.session){alert('Please end the session before closing this tab.');return;}if(t.cart.length>0){alert('Please process the order before closing this tab.');return;}closeGTab(idx);}}>×</button>}
          </div>)}
          <button className="order-tab new-tab-btn" onClick={addNewGTab}>{t.newTab}</button>
        </div>
      </div>
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center',marginBottom:'0.5rem'}}>
        <button className="btn-sm btn-danger" onClick={endAllSessions} disabled={busy}>⏹ End All Sessions</button>
      </div>
      {curGTab.session&&<div className="active-session-banner"><span>⏱ <strong>{curGTab.session.label}</strong> — {elapsed}</span><button className="btn-sm btn-danger" onClick={endSess} disabled={busy}>■ {t.endSession}</button></div>}
      <div className="stations-grid">{stations.map(tb=>{
        const isMyTab=curGTab.stationId===tb.id;
        const inOtherTab=gtabs.some((g,i)=>i!==activeGTab&&g.stationId===tb.id);
        const isActive=activeSess?.tableId===tb.id;
        return(<div key={tb.id} className={`station-card${isActive?' sess-active':''}${tb.status==='occupied'?' occupied':''}`}>
          <div className="sc-icon">{SI[tb.type]||'🎮'}</div>
          <div className="sc-name">{tb.type.charAt(0).toUpperCase()+tb.type.slice(1)} {tb.number}</div>
          {tb.hourly_rate>0&&<div className="sc-rate">${tb.hourly_rate}/hr</div>}
          <div className={`sc-status ${tb.status}`}>{tb.status}</div>
          {curGTab.session?.tableId===tb.id&&<div className="sc-timer">{elapsed}</div>}
          <div>{tb.status==='available'&&!inOtherTab?<button className="btn-primary btn-sm" onClick={()=>startSess(tb)} disabled={inOtherTab}>▶ Start</button>:curGTab.session?.tableId===tb.id?<button className="btn-sm btn-danger" onClick={endSess} disabled={busy}>■ End</button>:tb.status==='occupied'?<span className="muted" style={{fontSize:'0.73rem'}}>{inOtherTab?'other tab':'occupied'}</span>:<span className="muted" style={{fontSize:'0.73rem'}}>available</span>}</div>
        </div>);
      })}</div>
      {(curGTab.session||curGTab.cart.length>0)&&<><h3 className="section-lbl">Add Items</h3><div className="item-grid">{menuItems.filter(i=>!i.track_stock||i.stock_quantity>0).map(item=><div key={item.id} className={`item-card${item.track_stock&&!item.stock_quantity?' item-disabled':''}`} onClick={()=>{if(item.track_stock&&!item.stock_quantity)return;addItem(item);}}><span className="item-name">{item.name}</span><span className="item-price">${parseFloat(item.price).toFixed(2)}</span>{item.track_stock?<span className={`item-stock ${item.stock_quantity>0?'':'item-out'}`}>{item.stock_quantity>0?item.stock_quantity+' left':'OUT'}</span>:null}</div>)}</div></>}
      {!curGTab.session&&!curGTab.cart.length&&<p className="muted" style={{marginTop:'1rem'}}>Start a session to add items.</p>}
    </div>
    <div className="gaming-cart">
      <h3>{t.currentOrder}</h3>
      {!curGTab.cart.length?<div className="cart-empty">🛒<br/>{t.noItems}</div>:<>
        {curGTab.cart.map((item,i)=><div key={i} className="cart-row"><span className="cr-name">{item.name}</span><div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}><span className="cr-price">${(item.price*item.qty).toFixed(2)}</span><button className="btn-xs-ghost" onClick={()=>removeItem(item.id)}>✕</button></div></div>)}
        <div className="cs-row cs-total mt-sm"><span>{t.total}</span><span>${total.toFixed(2)}</span></div>
        <button className="btn-primary btn-full mt-sm" onClick={()=>setShowPay(true)} disabled={!!curGTab.session}>{curGTab.session?'⏳ End session first':`💳 ${t.pay}`}</button>
        {showPay&&<div className="pay-drawer"><h4>{t.selectPayment}</h4><div className="pay-opts">{[['cash','💵',t.cash],['mobile','📱',t.mobile]].map(([m,ico,lbl])=><button key={m} className="pay-opt" onClick={()=>placeOrder(m)} disabled={busy}>{ico}<span>{lbl}</span></button>)}</div><button className="btn-ghost btn-full" onClick={()=>setShowPay(false)}>{t.cancel}</button></div>}
      </>}
    </div>
  </div>);
}

function TablesPage(){
  const{t}=useLang();const emp=JSON.parse(localStorage.getItem('employee')||'{}');const mgmt=can(emp.role,'tables_manage');
  const[tables,setTables]=useState([]);const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({number:'',seats:'4',section:'main',type:'table',hourly_rate:'0'});
  const[resModal,setResModal]=useState(null);const[resForm,setResForm]=useState({guest_name:'',guest_phone:''});
  const[tableOrders,setTableOrders]=useState({});const[invoiceOrder,setInvoiceOrder]=useState(null);
  const[tick,setTick]=useState(0);
  useEffect(()=>{load();},[]);
  useEffect(()=>{const id=setInterval(()=>setTick(n=>n+1),15000);return()=>clearInterval(id);},[]);
  const load=async()=>{try{const d=await api.tables.getAll();const tbs=Array.isArray(d)?d:[];setTables(tbs);const occ=tbs.filter(tb=>tb.type==='table'&&tb.status==='occupied');const map={};await Promise.all(occ.map(async tb=>{try{const ords=await api.orders.getAll({table_id:tb.id});map[tb.id]=(Array.isArray(ords)?ords:[]).filter(o=>o.payment_status!=='paid'&&o.status!=='cancelled');}catch{}}));setTableOrders(map);}catch{}};
  const submitForm=async e=>{e.preventDefault();try{await api.tables.create({...form,number:parseInt(form.number),seats:parseInt(form.seats),hourly_rate:parseFloat(form.hourly_rate)});setShowForm(false);load();}catch(ex){alert(ex.message);}};
  const submitRes=async e=>{e.preventDefault();try{await api.tables.reserve(resModal,resForm);setResModal(null);setResForm({guest_name:'',guest_phone:''});load();}catch(ex){alert(ex.message);}};
  const dur=start=>{if(!start)return'';const d=Math.floor((Date.now()-new Date(start).getTime())/1000);return`${String(Math.floor(d/3600)).padStart(2,'0')}:${String(Math.floor((d%3600)/60)).padStart(2,'0')}:${String(d%60).padStart(2,'0')}`;};
  const payTableOrder=async(oid,method)=>{await api.orders.processPayment(oid,method);await api.orders.updateStatus(oid,'completed');const u=await api.orders.getOne(oid);setInvoiceOrder(u);load();};
  const SI={playstation:'🎮',pc:'🖥',billiards:'🎱',babyfoot:'⚽',table:'🍽'};
  const dining=tables.filter(tb=>tb.type==='table');const stations=tables.filter(tb=>tb.type!=='table');
  return(<div className="page">
    {invoiceOrder&&<InvoiceModal order={invoiceOrder} onClose={()=>setInvoiceOrder(null)}/>}
    {resModal&&<div className="modal-bg" onClick={()=>setResModal(null)}><div className="ot-modal" onClick={e=>e.stopPropagation()} style={{minWidth:320}}><h2>📅 {t.reserve}</h2><form onSubmit={submitRes}><div className="field"><label>{t.guestName}</label><input value={resForm.guest_name} onChange={e=>setResForm({...resForm,guest_name:e.target.value})} required/></div><div className="field"><label>{t.guestPhone}</label><input value={resForm.guest_phone} onChange={e=>setResForm({...resForm,guest_phone:e.target.value})}/></div><div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setResModal(null)}>{t.cancel}</button><button type="submit" className="btn-primary">{t.save}</button></div></form></div></div>}
    <div className="page-hd"><h2>🪑 {t.tablesMgmt}</h2>{mgmt&&<button className="btn-primary" onClick={()=>setShowForm(true)}>+ {t.addTable}</button>}</div>
    {showForm&&mgmt&&<div className="form-card"><form onSubmit={submitForm}><div className="form-row"><div className="field"><label>{t.tableNum}</label><input type="number" value={form.number} onChange={e=>setForm({...form,number:e.target.value})} required/></div><div className="field"><label>{t.type}</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{['table','playstation','pc','billiards','babyfoot'].map(v=><option key={v} value={v}>{v}</option>)}</select></div><div className="field"><label>{t.seats}</label><input type="number" value={form.seats} onChange={e=>setForm({...form,seats:e.target.value})}/></div><div className="field"><label>{t.hourlyRate}</label><input type="number" step="0.5" value={form.hourly_rate} onChange={e=>setForm({...form,hourly_rate:e.target.value})}/></div></div><div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button><button type="submit" className="btn-primary">{t.save}</button></div></form></div>}
    {dining.length>0&&<><h3 className="section-lbl">🍽 Dining Tables</h3><div className="tables-grid">{dining.map(tb=>{const openOrds=tableOrders[tb.id]||[];const totalOwed=openOrds.reduce((s,o)=>s+parseFloat(o.total||0),0);return(<div key={tb.id} className={`tbl-card status-${tb.status}`}>
      <div className="tbl-num">T{tb.number}</div><div className="tbl-seats">{tb.seats} seats · {tb.section}</div>
      {tb.status==='reserved'&&tb.reservation_name&&<div className="reservation-tag">📅 {tb.reservation_name}{tb.reservation_phone?` · ${tb.reservation_phone}`:''}</div>}
      <div className={`tbl-status ${tb.status}`}>{tb.status}</div>
      {openOrds.length>0&&<div className="table-bill-info">💰 {openOrds.length} order{openOrds.length>1?'s':''} · ${totalOwed.toFixed(2)}</div>}
      <div className="tbl-acts">
        {tb.status==='available'&&<><button className="btn-sm-outline" style={{borderColor:'#ef4444',color:'#ef4444'}} onClick={async()=>{await api.tables.updateStatus(tb.id,'occupied');load();}}>● Occupy</button><button className="btn-sm-outline" style={{borderColor:'#c49a2a',color:'#c49a2a'}} onClick={()=>setResModal(tb.id)}>📅 {t.reserve}</button></>}
        {tb.status==='occupied'&&openOrds.map(o=><div key={o.id} style={{width:'100%',marginTop:'0.3rem'}}><div style={{fontSize:'0.72rem',color:'var(--oat)'}}>{o.invoice_formatted||fmtInv(o.invoice_number||o.id)} · ${parseFloat(o.total).toFixed(2)}</div><div style={{display:'flex',gap:'0.25rem',marginTop:'0.2rem',flexWrap:'wrap',justifyContent:'center'}}>{[['cash','💵'],['mobile','📱']].map(([m,ico])=><button key={m} className="btn-sm" style={{fontSize:'0.7rem',padding:'0.18rem 0.45rem'}} onClick={()=>payTableOrder(o.id,m)}>{ico} {m}</button>)}</div></div>)}
        {tb.status==='occupied'&&openOrds.length===0&&<button className="btn-sm-outline" style={{borderColor:'#22c55e',color:'#22c55e'}} onClick={async()=>{await api.tables.updateStatus(tb.id,'available');load();}}>○ Free</button>}
        {tb.status==='reserved'&&<><button className="btn-sm-outline" style={{borderColor:'#ef4444',color:'#ef4444'}} onClick={async()=>{await api.tables.updateStatus(tb.id,'occupied');load();}}>● Seat</button><button className="btn-sm btn-danger" onClick={async()=>{await api.tables.cancelReservation(tb.id);load();}}>{t.cancelRes}</button></>}
        {mgmt&&<button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.tables.delete(tb.id);load();}}}>🗑</button>}
      </div>
    </div>);})}</div></>}
    {stations.length>0&&<><h3 className="section-lbl">🎮 Gaming Stations <span style={{fontSize:'0.7rem',color:'var(--oat)',fontWeight:400}}>— Start sessions in the Gaming page</span></h3>
    <div className="tables-grid">{stations.map(tb=><div key={tb.id} className={`tbl-card status-${tb.status}`}>
      <div className="tbl-icon">{SI[tb.type]||'🎮'}</div><div className="tbl-num">{tb.type.charAt(0).toUpperCase()+tb.type.slice(1)} {tb.number}</div>
      {tb.hourly_rate>0&&<div className="tbl-seats">${tb.hourly_rate}/hr</div>}
      {tb.session_start&&<div className="tbl-timer">⏱ {dur(tb.session_start)}</div>}
      <div className={`tbl-status ${tb.status}`}>{tb.status}</div>
      <div className="tbl-acts"><span style={{fontSize:'0.72rem',color:'var(--oat)'}}>→ Gaming page</span>{mgmt&&<button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.tables.delete(tb.id);load();}}}>🗑</button>}</div>
    </div>)}</div></>}
  </div>);
}

function ReportsPage(){
  const{t,lang,appName}=useLang();
  const[period,setPeriod]=useState('daily');const[date,setDate]=useState(new Date().toISOString().split('T')[0]);
  const[month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const[from,setFrom]=useState(()=>{const d=new Date();d.setDate(d.getDate()-7);return d.toISOString().split('T')[0];});
  const[to,setTo]=useState(new Date().toISOString().split('T')[0]);
  const[data,setData]=useState(null);
  useEffect(()=>{load();},[period,date,month,from,to]);
  const load=async()=>{try{let d;if(period==='daily')d=await api.reports.getDaily(date);else if(period==='weekly')d=await api.reports.getWeekly();else if(period==='monthly')d=await api.reports.getMonthly(month);else d=await api.reports.getRange(from,to);setData(d);}catch{}};
  const periodLabel=period==='daily'?date:period==='monthly'?month:`${from} → ${to}`;
  return(<div className="page">
    <div className="page-hd"><h2>📊 {t.salesReports}</h2><div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
      <div className="tab-group">{['daily','weekly','monthly','range'].map(p=><button key={p} className={period===p?'tab active':'tab'} onClick={()=>setPeriod(p)}>{t[p]}</button>)}</div>
      {data&&<button className="btn-ghost" onClick={()=>printWin(buildReportHTML(data,periodLabel,lang,{...t,appName}))}>🖨️ {t.printReport}</button>}
    </div></div>
    <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1rem',alignItems:'flex-end'}}>
      {period==='daily'&&<div className="field" style={{maxWidth:200,marginBottom:0}}><label>{t.date}</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>}

      {period==='monthly'&&<div className="field" style={{maxWidth:200,marginBottom:0}}><label>Month</label><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div>}
      {period==='range'&&<><div className="field" style={{maxWidth:175,marginBottom:0}}><label>{t.fromDate}</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div><div className="field" style={{maxWidth:175,marginBottom:0}}><label>{t.toDate}</label><input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div></>}
    </div>
    {data&&<>
      <div className="stats-grid">{[[data.total_orders??data.totalOrders??0,t.totalOrders,'📋'],[`$${parseFloat(data.total_revenue??data.totalRevenue??0).toFixed(2)}`,t.revenue,'💵'],...(data.takeaway_orders!=null?[[data.takeaway_orders,t.takeaway,'🛍️'],[data.dinein_orders,t.dineIn,'🪑']]:[])]
        .map(([v,l,ico],i)=><div key={i} className="stat-card"><div className="stat-val">{v}</div><div className="stat-lbl">{ico} {l}</div></div>)}</div>
      {(data.itemSales||data.topItems||data.popularItems||[]).length>0&&<div className="rpt-section"><h3>📦 {t.itemSales}</h3><div className="data-table"><table><thead><tr><th>#</th><th>{t.name}</th><th>Category</th><th>Qty</th><th>{t.revenue}</th></tr></thead><tbody>{(data.itemSales||data.topItems||data.popularItems||[]).map((it,i)=><tr key={i}><td>{i+1}</td><td><strong>{it.name}</strong></td><td>{it.category||'-'}</td><td>{it.total_quantity}</td><td>${parseFloat(it.total_revenue).toFixed(2)}</td></tr>)}</tbody></table></div></div>}
      {(data.dailyBreakdown||[]).length>0&&<div className="rpt-section"><h3>Daily Breakdown</h3><div className="data-table"><table><thead><tr><th>{t.date}</th><th>Orders</th><th>{t.revenue}</th></tr></thead><tbody>{(data.dailyBreakdown||[]).map((d,i)=><tr key={i}><td>{d.date}</td><td>{d.total_orders}</td><td>${parseFloat(d.total_revenue).toFixed(2)}</td></tr>)}</tbody></table></div></div>}
    </>}
  </div>);
}

function AccountingPage(){
  const{t,lang,appName}=useLang();
  const[tab,setTab]=useState('overview');const[expenses,setExpenses]=useState([]);const[loadingExp,setLoadingExp]=useState(true);
  const[monthData,setMonthData]=useState(null);const[weeklyData,setWeeklyData]=useState(null);const[rangeData,setRangeData]=useState(null);
  const[month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const[from,setFrom]=useState(()=>{const d=new Date();d.setDate(d.getDate()-30);return d.toISOString().split('T')[0];});
  const[to,setTo]=useState(new Date().toISOString().split('T')[0]);
  const[expFrom,setExpFrom]=useState('');const[expTo,setExpTo]=useState('');
  const[showForm,setShowForm]=useState(false);const[ef,setEf]=useState({category:'rent',amount:'',description:'',date:new Date().toISOString().split('T')[0]});
  const[qrImage,setQrImage]=useState(null);const[savingQR,setSavingQR]=useState(false);
  useEffect(()=>{api.reports.getMonthly(month).then(setMonthData).catch(()=>{});api.reports.getWeekly().then(setWeeklyData).catch(()=>{});api.settings.get('mobile_qr').then(r=>{if(r.value)setQrImage(r.value);}).catch(()=>{});loadExpenses();},[month]);
  const loadExpenses=async(f)=>{try{const p=f||{};if(expFrom)p.from=expFrom;if(expTo)p.to=expTo;const d=await api.expenses.getAll(Object.keys(p).length?p:undefined);setExpenses(Array.isArray(d)?d:[]);setLoadingExp(false);}catch{setExpenses([]);setLoadingExp(false);}};
  useEffect(()=>{if(from&&to)api.reports.getRange(from,to).then(setRangeData).catch(()=>{});},[from,to]);
  // Migrate localStorage expenses to DB on first load
  useEffect(()=>{const local=expDB.all();if(local.length>0){const timer=setTimeout(async()=>{try{await api.expenses.bulkImport(local);localStorage.removeItem('cafe_expenses');loadExpenses();}catch{}},1000);return()=>clearTimeout(timer);}},[]);
  const addExp=async e=>{e.preventDefault();try{await api.expenses.create({...ef,amount:parseFloat(ef.amount)});loadExpenses();}catch(ex){alert(ex.message);}setShowForm(false);setEf({category:'rent',amount:'',description:'',date:new Date().toISOString().split('T')[0]});};
  const saveQR=async()=>{if(!qrImage)return;setSavingQR(true);try{await api.settings.set('mobile_qr',qrImage);}catch(ex){alert(ex.message);}finally{setSavingQR(false);}};
  const activeData=rangeData||monthData;
  const totalRev=parseFloat(activeData?.total_revenue??activeData?.totalRevenue??0);
  const monthExp=expenses.filter(e=>e.date.startsWith(month));
  const totalExp=monthExp.reduce((s,e)=>s+(e.amount||0),0);
  const netProfit=totalRev-totalExp;const margin=totalRev>0?((netProfit/totalRev)*100).toFixed(1):'0.0';
  const bycat=monthExp.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
  const CATS=['rent','utilities','salaries','supplies','maintenance','other'];
  const periodLabel=`${month} | ${from} → ${to}`;
  return(<div className="page">
    <div className="page-hd"><h2>💰 {t.accounting}</h2><div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
      <div className="tab-group">{['overview','income','expenses','cashflow','qr'].map(tb=><button key={tb} className={tab===tb?'tab active':'tab'} onClick={()=>setTab(tb)}>{tb==='overview'?t.overview:tb==='income'?'Financial Summary':tb==='expenses'?t.expenses:tb==='cashflow'?t.cashFlow:t.qrPayment}</button>)}</div>
      {activeData&&<button className="btn-ghost" onClick={()=>printWin(buildReportHTML(activeData,periodLabel,lang,{...t,appName}))}>🖨️ {t.printReport}</button>}
    </div></div>
    {tab!=='expenses'&&tab!=='cashflow'&&tab!=='qr'&&<div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap',alignItems:'flex-end'}}>
      <div className="field" style={{maxWidth:180,marginBottom:0}}><label>Month</label><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div>
      <div className="field" style={{maxWidth:160,marginBottom:0}}><label>{t.fromDate}</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div>
      <div className="field" style={{maxWidth:160,marginBottom:0}}><label>{t.toDate}</label><input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div>
    </div>}
    {tab==='overview'&&<><div className="stats-grid"><div className="stat-card sc-green"><div className="stat-val">${totalRev.toFixed(2)}</div><div className="stat-lbl">💵 {t.totalRevenue}</div></div><div className="stat-card sc-red"><div className="stat-val">${totalExp.toFixed(2)}</div><div className="stat-lbl">📤 {t.totalExpenses}</div></div><div className="stat-card" style={{borderColor:netProfit>=0?'var(--green)':'var(--red)'}}><div className="stat-val" style={{color:netProfit>=0?'var(--green)':'var(--red)'}}>${netProfit.toFixed(2)}</div><div className="stat-lbl">📈 {t.netProfit}</div></div><div className="stat-card"><div className="stat-val">{margin}%</div><div className="stat-lbl">📊 {t.grossMargin}</div></div></div>
    {(activeData?.itemSales||[]).length>0&&<div className="rpt-section"><h3>📦 {t.itemSales}</h3><div className="data-table"><table><thead><tr><th>#</th><th>Item</th><th>Cat.</th><th>Qty</th><th>{t.revenue}</th></tr></thead><tbody>{(activeData.itemSales||[]).map((it,i)=><tr key={i}><td>{i+1}</td><td><strong>{it.name}</strong></td><td>{it.category||'-'}</td><td>{it.total_quantity}</td><td>${parseFloat(it.total_revenue).toFixed(2)}</td></tr>)}</tbody></table></div></div>}
    <div className="rpt-section"><h3>{t.opEx} — {month}</h3><div className="data-table"><table><thead><tr><th>{t.expCategory}</th><th>{t.amount}</th><th>% Rev</th></tr></thead><tbody>{!Object.keys(bycat).length&&<tr><td colSpan={3} className="muted-cell">No expenses</td></tr>}{CATS.filter(c=>bycat[c]).map(c=><tr key={c}><td><strong>{t[c]||c}</strong></td><td>${bycat[c].toFixed(2)}</td><td>{totalRev>0?((bycat[c]/totalRev)*100).toFixed(1):0}%</td></tr>)}</tbody></table></div></div></>}
    {tab==='income'&&<div>
      <div className="acc-cards-grid">
        <div className="acc-big-card acc-revenue">
          <div className="acc-card-icon">💵</div>
          <div className="acc-card-label">Total Revenue (Sales)</div>
          <div className="acc-card-value">${totalRev.toFixed(2)}</div>
          <div className="acc-card-sub">{(activeData?.total_orders||activeData?.totalOrders||0)} orders · {month}</div>
        </div>
        <div className="acc-big-card acc-expense">
          <div className="acc-card-icon">📤</div>
          <div className="acc-card-label">Total Expenses Recorded</div>
          <div className="acc-card-value">${totalExp.toFixed(2)}</div>
          <div className="acc-card-sub">{monthExp.length} expense entries</div>
        </div>
        <div className={`acc-big-card ${netProfit>=0?'acc-profit':'acc-loss'}`}>
          <div className="acc-card-icon">{netProfit>=0?'📈':'📉'}</div>
          <div className="acc-card-label">Net Profit / Loss</div>
          <div className="acc-card-value">${netProfit.toFixed(2)}</div>
          <div className="acc-card-sub">Margin: {margin}%</div>
        </div>
      </div>
      <div className="acc-breakdown-grid">
        <div className="rpt-section">
          <h3>💰 Revenue Breakdown</h3>
          <div className="acc-metric-row"><span>Total Revenue</span><strong className="col-green">${totalRev.toFixed(2)}</strong></div>
          <div className="acc-metric-row"><span>Operating Expenses</span><strong className="col-red">-${totalExp.toFixed(2)}</strong></div>
          <div className="acc-metric-row acc-metric-total"><span>Net Income</span><strong className={netProfit>=0?'col-green':'col-red'}>${netProfit.toFixed(2)}</strong></div>
        </div>
        <div className="rpt-section">
          <h3>📦 Top Selling Items</h3>
          {(activeData?.itemSales||[]).slice(0,6).map((it,i)=><div key={i} className="acc-item-row">
            <span className="acc-item-rank">#{i+1}</span>
            <span className="acc-item-name">{it.name}</span>
            <span className="acc-item-qty">{it.total_quantity} sold</span>
            <span className="acc-item-rev col-green">${parseFloat(it.total_revenue).toFixed(2)}</span>
          </div>)}
          {!(activeData?.itemSales||[]).length&&<p className="muted" style={{padding:'1rem 0'}}>No sales data for this period</p>}
        </div>
      </div>
      <div className="rpt-section">
        <h3>📊 Expense Breakdown — {month}</h3>
        {!Object.keys(bycat).length?<p className="muted" style={{padding:'0.5rem 0'}}>No expenses recorded this month</p>
        :<>{CATS.filter(c=>bycat[c]).map(c=><div key={c} className="acc-exp-bar-row">
          <span className="acc-exp-label">{t[c]||c}</span>
          <div className="acc-exp-bar-track"><div className="acc-exp-bar-fill" style={{width:totalExp>0?`${Math.min(100,(bycat[c]/totalExp)*100).toFixed(0)}%`:'0%'}}/></div>
          <span className="acc-exp-amt">${bycat[c].toFixed(2)}</span>
          <span className="acc-exp-pct">{totalRev>0?((bycat[c]/totalRev)*100).toFixed(1):0}%</span>
        </div>)}</>}
      </div>
    </div>}
    {tab==='expenses'&&<>
    <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'flex-end',marginBottom:'0.75rem'}}>
      <div className="field" style={{marginBottom:0,maxWidth:160}}><label>{t.fromDate}</label><input type="date" value={expFrom} onChange={e=>setExpFrom(e.target.value)}/></div>
      <div className="field" style={{marginBottom:0,maxWidth:160}}><label>{t.toDate}</label><input type="date" value={expTo} onChange={e=>setExpTo(e.target.value)}/></div>
      <button className="btn-primary" onClick={()=>loadExpenses()} style={{padding:'0.45rem 1rem',fontSize:'0.82rem'}}>🔍 Filter</button>
      {(expFrom||expTo)&&<button className="btn-ghost" onClick={async()=>{setExpFrom('');setExpTo('');const d=await api.expenses.getAll();setExpenses(Array.isArray(d)?d:[]);}} style={{padding:'0.45rem 1rem',fontSize:'0.82rem'}}>✕ Clear</button>}
      <span style={{fontSize:'0.78rem',color:'var(--oat)',marginLeft:'auto'}}>{expenses.length} expense{expenses.length!==1?'s':''}</span>
    </div>
      <button className="btn-primary mb-sm" onClick={()=>setShowForm(!showForm)}>+ {t.addExpense}</button>
    {showForm&&<div className="form-card"><form onSubmit={addExp}><div className="form-row"><div className="field"><label>{t.expCategory}</label><select value={ef.category} onChange={e=>setEf({...ef,category:e.target.value})}>{CATS.map(c=><option key={c} value={c}>{t[c]||c}</option>)}</select></div><div className="field"><label>{t.amount}</label><input type="number" step="0.01" value={ef.amount} onChange={e=>setEf({...ef,amount:e.target.value})} required/></div><div className="field"><label>{t.date}</label><input type="date" value={ef.date} onChange={e=>setEf({...ef,date:e.target.value})}/></div></div><div className="field"><label>{t.expDesc}</label><input value={ef.description} onChange={e=>setEf({...ef,description:e.target.value})}/></div><div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button><button type="submit" className="btn-primary">{t.save}</button></div></form></div>}
    <div className="data-table"><table><thead><tr><th>{t.date}</th><th>{t.expCategory}</th><th>{t.expDesc}</th><th>{t.amount}</th><th></th></tr></thead><tbody>{!expenses.length&&<tr><td colSpan={5} className="muted-cell">No expenses</td></tr>}{expenses.map(ex=><tr key={ex.id}><td>{ex.date}</td><td><span className="badge badge-muted">{t[ex.category]||ex.category}</span></td><td>{ex.description||'-'}</td><td><strong>${parseFloat(ex.amount).toFixed(2)}</strong></td><td><button className="btn-sm btn-danger" onClick={async()=>{try{await api.expenses.delete(ex.id);loadExpenses();}catch{}}}>🗑</button></td></tr>)}</tbody></table></div></>}
    {tab==='cashflow'&&<div className="rpt-section"><h3>💧 {t.cashFlow}</h3>{weeklyData?.dailyBreakdown?.length>0&&<div className="data-table"><table><thead><tr><th>{t.date}</th><th>Orders</th><th>{t.revenue}</th><th>Net Cash</th></tr></thead><tbody>{weeklyData.dailyBreakdown.map((d,i)=>{const rev=parseFloat(d.total_revenue||0),net=rev;return<tr key={i}><td>{d.date}</td><td>{d.total_orders}</td><td className="col-green">${rev.toFixed(2)}</td><td className={net>=0?'col-green':'col-red'}><strong>${net.toFixed(2)}</strong></td></tr>;})}</tbody></table></div>}<div className="is-row is-total mt-sm"><span>Net — {month}</span><span className={netProfit>=0?'col-green':'col-red'}><strong>${netProfit.toFixed(2)}</strong></span></div></div>}
    {tab==='qr'&&<div className="form-card"><h4>📱 {t.qrPayment}</h4><p style={{fontSize:'0.83rem',color:'var(--oat)',marginBottom:'1rem'}}>Upload your payment QR code (WhatsApp Pay, PayPal, etc.). Staff will see it on the POS mobile payment screen so customers can scan and pay.</p>
    {qrImage&&<div style={{textAlign:'center',marginBottom:'1rem'}}><img src={qrImage} alt="QR" style={{maxWidth:200,borderRadius:8,border:'2px solid var(--border)'}}/><p style={{fontSize:'0.75rem',color:'var(--oat)',marginTop:'0.4rem'}}>{t.currentQR}</p></div>}
    <label className="upload-label" style={{display:'block',marginBottom:'0.75rem'}}>{qrImage?'🔄 Change QR Image':'📎 Upload QR Image'}<input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;if(f.size>400000){alert('Image too large. Please use a smaller file (under 400KB).');return;}const r=new FileReader();r.onload=ev=>setQrImage(ev.target.result);r.readAsDataURL(f);}}/></label>
    {qrImage&&<button className="btn-primary" onClick={saveQR} disabled={savingQR}>{savingQR?'Saving…':'💾 Save QR Code'}</button>}</div>}
  </div>);
}

function BusinessDayPage(){
  const{t}=useLang();const[today,setToday]=useState(null);const[history,setHistory]=useState([]);const[cash,setCash]=useState('');const[notes,setNotes]=useState('');const[busy,setBusy]=useState(false);
  const[expectedCash,setExpectedCash]=useState(null);
  useEffect(()=>{load();loadExpected();},[]);
  const load=async()=>{try{const[d,h]=await Promise.all([api.businessDay.today(),api.businessDay.history()]);setToday(d);setHistory(Array.isArray(h)?h:[]);}catch{}};
  const loadExpected=async()=>{try{const d=await api.businessDay.expectedCash();setExpectedCash(d);}catch{}};
  const openDay=async()=>{setBusy(true);try{await api.businessDay.open({opening_cash:parseFloat(cash)||0,notes});setCash('');setNotes('');load();loadExpected();}catch(ex){alert(ex.message);}finally{setBusy(false);}};
  const closeDay=async()=>{setBusy(true);try{await api.businessDay.close({closing_cash:parseFloat(cash)||0,notes});setCash('');setNotes('');load();loadExpected();}catch(ex){alert(ex.message);}finally{setBusy(false);}};
  const isOpen=today?.status==='open';
  const expRow=(key,val,clr)=>val!=null&&<div className="day-calc-row" style={clr?{color:clr,fontWeight:700}:{}}><span>{key}</span><span>{typeof val==='number'?'$'+val.toFixed(2):val}</span></div>;
  const[todayExpenses,setTodayExpenses]=useState([]);
  useEffect(()=>{if(today?.date){api.expenses.getAll({from:today.date,to:today.date}).then(d=>setTodayExpenses(Array.isArray(d)?d:[])).catch(()=>{});}},[today]);
  const expenseTotal=todayExpenses.reduce((s,e)=>s+(e.amount||0),0);
  const calcExpected=expectedCash?expectedCash.expected_cash-expenseTotal:0;
  return(<div className="page">
    <div className="page-hd"><h2>📅 {t.businessDay}</h2></div>
    <div className="day-status-card">
      <div className="day-status-left"><div className={`day-dot ${isOpen?'day-open':'day-closed'}`}/><div><div className="day-status-label">{isOpen?t.dayOpen:t.dayClosed}</div><div className="day-date">{today?.date||new Date().toLocaleDateString('en-CA')}</div>{today?.opened_at&&<div className="day-time">Opened: {new Date(today.opened_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'})}</div>}{today?.closed_at&&<div className="day-time">Closed: {new Date(today.closed_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'})}</div>}</div></div>
      <div className="day-controls">
        {/* Cash drawer expected calculation */}
        {isOpen&&expectedCash&&<div className="day-calc-box">
          <div style={{fontSize:'0.72rem',fontWeight:700,color:'var(--oat)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.4rem'}}>💰 Expected Cash Drawer</div>
          {expRow('Opening Cash',expectedCash.opening_cash)}
          {expRow('+ Today Revenue',expectedCash.revenue,'var(--green)')}
          {expenseTotal>0&&expRow('- Today Expenses',expenseTotal,'var(--red)')}
          <div className="day-calc-row day-calc-total"><span>Expected in Drawer</span><span style={{color:'var(--green)'}}>${Math.max(0,calcExpected).toFixed(2)}</span></div>
        </div>}
        <div className="field" style={{marginBottom:'0.5rem'}}><label>{isOpen?t.closingCash:t.openingCash} ($)</label><input type="number" step="0.01" value={cash} onChange={e=>setCash(e.target.value)} placeholder="0.00"/></div>
        <div className="field" style={{marginBottom:'0.75rem'}}><label>Notes</label><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional…"/></div>
        {isOpen?<button className="btn-primary" style={{background:'var(--red)'}} onClick={closeDay} disabled={busy}>■ {t.closeDay}</button>:<button className="btn-primary" style={{background:'var(--green)'}} onClick={openDay} disabled={busy}>▶ {t.openDay}</button>}
      </div>
    </div>
    <h3 className="section-lbl">{t.dayHistory}</h3>
    <div className="data-table"><table><thead><tr><th>{t.date}</th><th>{t.status}</th><th>Opened</th><th>Closed</th><th>{t.openingCash}</th><th>{t.closingCash}</th></tr></thead><tbody>{history.map(d=><tr key={d.id}><td>{d.date}</td><td><span className={`badge ${d.status==='open'?'badge-ok':'badge-muted'}`}>{d.status==='open'?t.dayOpen:t.dayClosed}</span></td><td>{d.opened_at?new Date(d.opened_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'}):'-'}</td><td>{d.closed_at?new Date(d.closed_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'}):'-'}</td><td>${parseFloat(d.opening_cash||0).toFixed(2)}</td><td>${parseFloat(d.closing_cash||0).toFixed(2)}</td></tr>)}</tbody></table></div>
  </div>);
}

function MenuPage(){const{t}=useLang();const emp=JSON.parse(localStorage.getItem('employee')||'{}');const mgmt=can(emp.role,'menu_manage');const[cats,setCats]=useState([]);const[items,setItems]=useState([]);const[tab,setTab]=useState('items');const[showForm,setShowForm]=useState(false);const[editing,setEditing]=useState(null);const[form,setForm]=useState({name:'',description:'',price:'',category_id:'',preparation_time:'5',is_available:1,track_stock:0,stock_quantity:''});const[catForm,setCatForm]=useState({name:'',description:'',icon:''});const[showCatIconPicker,setShowCatIconPicker]=useState(false);useEffect(()=>{load();},[]);const load=async()=>{try{const[c,i]=await Promise.all([api.menu.getCategories(),api.menu.getItems()]);setCats(Array.isArray(c)?c:[]);setItems(Array.isArray(i)?i:[]);}catch{}};const si=async e=>{e.preventDefault();try{const d={...form,price:parseFloat(form.price),category_id:form.category_id?parseInt(form.category_id):null,track_stock:form.track_stock?1:0,stock_quantity:form.track_stock?parseInt(form.stock_quantity||0):0};if(editing)await api.menu.updateItem(editing.id,d);else await api.menu.createItem(d);setShowForm(false);setEditing(null);setForm({name:'',description:'',price:'',category_id:'',preparation_time:'5',is_available:1,track_stock:0,stock_quantity:''});load();}catch(ex){alert(ex.message);}};const sc=async e=>{e.preventDefault();try{await api.menu.createCategory(catForm);setCatForm({name:'',description:'',icon:''});load();}catch(ex){alert(ex.message);}};const se=item=>{setEditing(item);setForm({name:item.name,description:item.description||'',price:item.price.toString(),category_id:item.category_id?.toString()||'',preparation_time:item.preparation_time?.toString()||'5',is_available:item.is_available,track_stock:item.track_stock,stock_quantity:item.stock_quantity?.toString()||''});setShowForm(true);};
const CAT_ICON_KEYS=Object.keys(ALL_ICONS);
return(<div className="page"><div className="page-hd"><h2>🍽 {t.menuMgmt}</h2><div className="tab-group"><button className={tab==='items'?'tab active':'tab'} onClick={()=>setTab('items')}>{t.items}</button><button className={tab==='categories'?'tab active':'tab'} onClick={()=>setTab('categories')}>{t.categories}</button></div></div>
{tab==='items'&&<>{mgmt&&<button className="btn-primary mb-sm" onClick={()=>{setShowForm(true);setEditing(null);setForm({name:'',description:'',price:'',category_id:'',preparation_time:'5',is_available:1});}}>+ {t.addItem}</button>}{showForm&&mgmt&&<div className="form-card"><h4>{editing?t.editEmployee:t.addItem}</h4><form onSubmit={si}><div className="form-row"><div className="field"><label>{t.name}</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div className="field"><label>{t.price}</label><input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/></div></div><div className="form-row"><div className="field"><label>{t.category}</label><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">--</option>{cats.map(c=><option key={c.id} value={c.id}>{c.icon||'🍽'} {c.name}</option>)}</select></div><div className="field"><label>{t.prepTime}</label><input type="number" value={form.preparation_time} onChange={e=>setForm({...form,preparation_time:e.target.value})}/></div></div><div className="field"><label>{t.description}</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2}/></div><div className="field inline-check"><input type="checkbox" checked={!!form.is_available} onChange={e=>setForm({...form,is_available:e.target.checked?1:0})}/><label>{t.available}</label></div>
<div className="field inline-check"><input type="checkbox" checked={!!form.track_stock} onChange={e=>{const v=e.target.checked?1:0;setForm({...form,track_stock:v,stock_quantity:v?form.stock_quantity:'0'})}}/><label>Track Stock</label></div>
{!!form.track_stock&&<div className="field"><label>Stock Quantity</label><input type="number" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})} min="0"/></div>}<div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button><button type="submit" className="btn-primary">{editing?t.update:t.save}</button></div></form></div>}<div className="data-table"><table><thead><tr><th>{t.name}</th><th>{t.category}</th><th>{t.price}</th><th>{t.prepTime}</th><th>{t.available}</th><th>Stock</th>{mgmt&&<th>{t.actions}</th>}</tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{cats.find(c=>c.id===item.category_id)?.name||'-'}</td><td>${parseFloat(item.price).toFixed(2)}</td><td>{item.preparation_time}m</td><td><span className={`badge ${item.is_available?'badge-ok':'badge-muted'}`}>{item.is_available?'✓':'✕'}</span></td><td>{item.track_stock?<span className={`badge ${item.stock_quantity>0?'badge-ok':'badge-danger'}`}>{item.stock_quantity} left</span>:<span className="muted" style={{fontSize:'0.72rem'}}>—</span>}</td>{mgmt&&<td><button className="btn-sm" onClick={()=>se(item)}>✏</button><button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.menu.deleteItem(item.id);load();}}}>🗑</button></td>}</tr>)}</tbody></table></div></>}
{tab==='categories'&&<>{mgmt&&<div className="form-card"><form onSubmit={sc}><div className="form-row"><div className="field"><label>{t.name}</label><input value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required/></div><div className="field"><label>{t.description}</label><input value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})}/></div></div><div className="field"><label>Icon</label><div className="icon-picker-wrap">
  <button type="button" className="icon-picker-trigger" onClick={()=>setShowCatIconPicker(!showCatIconPicker)}>
    <span className="icon-picker-preview">{catForm.icon||'🍽'}</span> <span style={{fontSize:'0.75rem',color:'var(--oat)'}}>Choose icon ▾</span>
  </button>
  {showCatIconPicker&&<div className="icon-picker-dropdown large" style={{position:'absolute',top:'100%',left:0,zIndex:50,marginTop:4}}>
    {CAT_ICON_KEYS.map(ico=><button key={ico} type="button" className={`icon-pick-btn${catForm.icon===ico?' selected':''}`} onClick={()=>{setCatForm({...catForm,icon:ico});setShowCatIconPicker(false);}} title={ALL_ICONS[ico]}>{ico}</button>)}
  </div>}
</div></div>
<button type="submit" className="btn-primary">+ {t.addCategory}</button></form></div>}<div className="data-table"><table><thead><tr><th>{t.name}</th><th>Icon</th><th>{t.description}</th><th>Items</th>{mgmt&&<th>{t.actions}</th>}</tr></thead><tbody>{cats.map(cat=><tr key={cat.id}><td><strong>{cat.name}</strong></td><td style={{fontSize:'1.3rem'}}>{cat.icon||'🍽'}</td><td>{cat.description||'-'}</td><td>{items.filter(i=>i.category_id===cat.id).length}</td>{mgmt&&<td><button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.menu.deleteCategory(cat.id);load();}}}>🗑</button></td>}</tr>)}</tbody></table></div></>}
</div>);}

function InventoryPage(){const{t}=useLang();const emp=JSON.parse(localStorage.getItem('employee')||'{}');const mgmt=can(emp.role,'inventory_manage');const[inv,setInv]=useState([]);const[low,setLow]=useState([]);const[showForm,setShowForm]=useState(false);const[adjId,setAdjId]=useState(null);const[form,setForm]=useState({name:'',quantity:'',unit:'',min_quantity:'10',cost_per_unit:'0'});const[adjVal,setAdjVal]=useState(0);useEffect(()=>{load();},[]);const load=async()=>{try{const[a,l]=await Promise.all([api.inventory.getAll(),api.inventory.getLowStock()]);setInv(Array.isArray(a)?a:[]);setLow(Array.isArray(l)?l:[]);}catch{}};const sub=async e=>{e.preventDefault();try{await api.inventory.create({...form,quantity:parseFloat(form.quantity),min_quantity:parseFloat(form.min_quantity),cost_per_unit:parseFloat(form.cost_per_unit)});setShowForm(false);setForm({name:'',quantity:'',unit:'',min_quantity:'10',cost_per_unit:'0'});load();}catch(ex){alert(ex.message);}};const doAdj=async id=>{try{await api.inventory.adjust(id,{adjustment:adjVal});setAdjId(null);setAdjVal(0);load();}catch(ex){alert(ex.message);}};
return(<div className="page"><div className="page-hd"><h2>📦 {t.inventoryMgmt}</h2>{mgmt&&<button className="btn-primary" onClick={()=>setShowForm(true)}>+ {t.addInventory}</button>}</div>{low.length>0&&<div className="alert alert-warn">⚠️ {t.lowStock}: {low.map(i=>i.name).join(', ')}</div>}{showForm&&mgmt&&<div className="form-card"><form onSubmit={sub}><div className="form-row"><div className="field"><label>{t.name}</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div className="field"><label>{t.quantity}</label><input type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/></div><div className="field"><label>{t.unit}</label><input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} required/></div></div><div className="form-row"><div className="field"><label>{t.minQty}</label><input type="number" value={form.min_quantity} onChange={e=>setForm({...form,min_quantity:e.target.value})}/></div><div className="field"><label>{t.costPerUnit}</label><input type="number" step="0.01" value={form.cost_per_unit} onChange={e=>setForm({...form,cost_per_unit:e.target.value})}/></div></div><div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button><button type="submit" className="btn-primary">{t.save}</button></div></form></div>}<div className="data-table"><table><thead><tr><th>{t.name}</th><th>{t.quantity}</th><th>{t.unit}</th><th>{t.minQty}</th><th>{t.costPerUnit}</th><th>{t.status}</th>{mgmt&&<th>{t.actions}</th>}</tr></thead><tbody>{inv.map(item=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.quantity}</td><td>{item.unit}</td><td>{item.min_quantity}</td><td>${parseFloat(item.cost_per_unit||0).toFixed(2)}</td><td><span className={`badge ${item.quantity<=item.min_quantity?'badge-danger':'badge-ok'}`}>{item.quantity<=item.min_quantity?'⚠ Low':'✓ OK'}</span></td>{mgmt&&<td>{adjId===item.id?<span className="inline-adj"><input className="adj-inp" type="number" value={adjVal} onChange={e=>setAdjVal(Number(e.target.value))}/><button className="btn-sm" onClick={()=>doAdj(item.id)}>✓</button><button className="btn-sm btn-ghost" onClick={()=>setAdjId(null)}>✕</button></span>:<><button className="btn-sm" onClick={()=>setAdjId(item.id)}>± {t.adjust}</button><button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.inventory.delete(item.id);load();}}}>🗑</button></>}</td>}</tr>)}</tbody></table></div></div>);}


function CustomersPage(){
  const{t}=useLang();
  const[custs,setCusts]=useState([]);const[search,setSearch]=useState('');const[showForm,setShowForm]=useState(false);
  const[editing,setEditing]=useState(null);const[form,setForm]=useState({name:'',phone:'',email:'',notes:''});
  useEffect(()=>{load();},[search]);
  const load=async()=>{try{const d=await api.customers.getAll(search||'');setCusts(Array.isArray(d)?d:[]);}catch{}};
  const sub=async e=>{e.preventDefault();try{if(editing)await api.customers.update(editing.id,form);else await api.customers.create(form);setShowForm(false);setEditing(null);setForm({name:'',phone:'',email:'',notes:''});load();}catch(ex){alert(ex.message);}};
  const se=cust=>{setEditing(cust);setForm({name:cust.name,phone:cust.phone||'',email:cust.email||'',notes:cust.notes||''});setShowForm(true);};
  return(<div className="page">
    <div className="page-hd"><h2>👤 {t.customers}</h2>
      <button className="btn-primary" onClick={()=>{setShowForm(true);setEditing(null);setForm({name:'',phone:'',email:'',notes:''});}}>+ {t.addCustomer}</button>
    </div>
    <div className="filter-bar">
      <input className="person-add-inp" style={{maxWidth:300}} placeholder={t.searchCustomer||'Search customers...'} value={search} onChange={e=>setSearch(e.target.value)}/>
    </div>
    {showForm&&<div className="form-card"><h4>{editing?t.editCustomer:t.addCustomer}</h4>
      <form onSubmit={sub}><div className="form-row">
        <div className="field"><label>{t.customerName}</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
        <div className="field"><label>{t.customerPhone}</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
      </div><div className="form-row">
        <div className="field"><label>{t.customerEmail}</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div className="field"><label>{t.customerNotes}</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
      </div><div className="form-actions">
        <button type="button" className="btn-ghost" onClick={()=>{setShowForm(false);setEditing(null);}}>{t.cancel}</button>
        <button type="submit" className="btn-primary">{editing?t.update:t.save}</button>
      </div></form>
    </div>}
    {custs.length===0?<p className="muted" style={{marginTop:'1rem'}}>{t.noCustomers}</p>
    :<div className="data-table"><table><thead><tr><th>{t.customerName}</th><th>{t.customerPhone}</th><th>{t.customerEmail}</th><th>{t.customerNotes}</th><th>{t.customerSince}</th><th>{t.actions}</th></tr></thead><tbody>{custs.map(cust=><tr key={cust.id}>
      <td><strong>{cust.name}</strong></td><td>{cust.phone||'-'}</td><td>{cust.email||'-'}</td><td style={{color:'var(--oat)',fontSize:'0.82rem'}}>{cust.notes||'-'}</td>
      <td style={{fontSize:'0.78rem',color:'var(--oat)'}}>{cust.created_at?new Date(cust.created_at).toLocaleDateString():'-'}</td>
      <td><button className="btn-sm" onClick={()=>se(cust)}>✏ {t.edit}</button>
        <button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.customers.delete(cust.id);load();}}}>🗑</button></td>
    </tr>)}</tbody></table></div>}
  </div>);
}

function EmployeesPage(){const{t}=useLang();const[emps,setEmps]=useState([]);const[showForm,setShowForm]=useState(false);const[editing,setEditing]=useState(null);const[form,setForm]=useState({name:'',email:'',password:'',role:'cashier',phone:''});const[resetTarget,setResetTarget]=useState(null);const[newPwd,setNewPwd]=useState('');useEffect(()=>{load();},[]);const load=async()=>{try{const d=await api.employees.getAll();setEmps(Array.isArray(d)?d:[]);}catch{}};const sub=async e=>{e.preventDefault();try{if(editing)await api.employees.update(editing.id,{name:form.name,email:form.email,role:form.role,phone:form.phone});else await api.employees.create(form);setShowForm(false);setEditing(null);setForm({name:'',email:'',password:'',role:'cashier',phone:''});load();}catch(ex){alert(ex.message);}};const se=emp=>{setEditing(emp);setForm({name:emp.name,email:emp.email,password:'',role:emp.role,phone:emp.phone||''});setShowForm(true);};const resetPwd=async()=>{try{await api.employees.resetPassword(resetTarget.id,newPwd);alert('✓ Password reset for '+resetTarget.name);setResetTarget(null);setNewPwd('');load();}catch(ex){alert(ex.message);}};const curEmp=JSON.parse(localStorage.getItem('employee')||'{}');const isSA=curEmp.role==='superadmin';const ROLES=['cashier','waiter','kitchen','manager','admin'];
return(<div className="page"><div className="page-hd"><h2>👥 {t.employees}</h2><button className="btn-primary" onClick={()=>{setShowForm(true);setEditing(null);setForm({name:'',email:'',password:'',role:'cashier',phone:''});}}>+ {t.addEmployee}</button></div>{showForm&&<div className="form-card"><h4>{editing?t.editEmployee:t.addEmployee}</h4><form onSubmit={sub}><div className="form-row"><div className="field"><label>{t.name}</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div className="field"><label>{t.email}</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div></div><div className="form-row">{!editing&&<div className="field"><label>{t.password}</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>}<div className="field"><label>{t.role}</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{ROLES.map(r=><option key={r} value={r}>{t[r]||r}</option>)}</select></div><div className="field"><label>{t.phone}</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div>{form.role&&<div className="alert alert-info">🔑 {t[`rp_${form.role}`]}</div>}<div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button><button type="submit" className="btn-primary">{editing?t.update:t.save}</button></div></form></div>}{resetTarget&&<div className="modal-bg" onClick={()=>setResetTarget(null)}><div className="ot-modal" onClick={e=>e.stopPropagation()}><h3>🔑 Reset Password</h3><p>Set new password for <strong>{resetTarget.name}</strong> ({resetTarget.email})</p><div className="field"><label>New Password</label><input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Enter new password" autoFocus/></div><div className="form-actions"><button type="button" className="btn-ghost" onClick={()=>setResetTarget(null)}>{t.cancel}</button><button className="btn-primary" onClick={resetPwd} disabled={!newPwd}>Reset Password</button></div></div></div>}<div className="data-table"><table><thead><tr><th>{t.name}</th><th>{t.email}</th><th>{t.role}</th><th>Permissions</th><th>{t.phone}</th><th>{t.status}</th><th>{t.actions}</th></tr></thead><tbody>{emps.map(emp=><tr key={emp.id}><td><strong>{emp.name}</strong></td><td>{emp.email}</td><td><span className="role-badge">{t[emp.role]||emp.role}</span></td><td><small className="muted">{t[`rp_${emp.role}`]}</small></td><td>{emp.phone||'-'}</td><td>{emp.role==='superadmin'&&!isSA?<span className="muted" style={{fontSize:"0.72rem"}}>🔒</span>:<button className={`badge-btn ${emp.is_active?'badge-ok':'badge-muted'}`} onClick={async()=>{await api.employees.update(emp.id,{is_active:emp.is_active?0:1});load();}}>{emp.is_active?t.active:t.inactive}</button>}</td><td>{emp.role==='superadmin'&&!isSA?<span className="muted" style={{fontSize:"0.72rem"}}>🔒 {t.superadmin}</span>:<button className="btn-sm" onClick={()=>se(emp)}>✏ {t.edit}</button>}{isSA&&(parseInt(emp.id)!==parseInt(JSON.parse(localStorage.getItem("employee")||"{}").id)?<button className="btn-sm btn-danger" onClick={async()=>{if(confirm(t.confirmDelete)){await api.employees.delete(emp.id);load();}}}>🗑</button>:<span className="muted" style={{fontSize:"0.72rem"}}>Cannot delete self</span>)}{isSA&&<button className="btn-sm" style={{background:'var(--caramel)',color:'#fff',border:'none',marginLeft:'0.25rem',padding:'0.2rem 0.5rem',borderRadius:'3px',cursor:'pointer',fontSize:'0.72rem'}} onClick={()=>{setResetTarget(emp);setNewPwd('');}}>🔑</button>}</td></tr>)}</tbody></table></div></div>);}

function SettingsPage(){
  const {t,setAppName:setGlobalAppName}=useLang();
  const [localName,setLocalName] = useState(() => localStorage.getItem('cafe_custom_name') || t.appName);
  const [colors,setColors] = useState(() => { try { return JSON.parse(localStorage.getItem('cafe_colors')||'null'); } catch{ return null; } });

  const saveName = () => { localStorage.setItem('cafe_custom_name',localName); api.settings.set('app_name',localName).catch(()=>{}); setGlobalAppName(localName); alert('Saved!'); };
  const applyPreset = p => {
    setColors(p);
    localStorage.setItem('cafe_colors',JSON.stringify(p));
    document.documentElement.style.setProperty('--caramel',p.primary);
    document.documentElement.style.setProperty('--caramel-l',p.accent);
    if(p.dark)document.documentElement.style.setProperty('--espresso',p.dark);
    if(p.medium)document.documentElement.style.setProperty('--dark-wood',p.medium);
    if(p.muted)document.documentElement.style.setProperty('--oat',p.muted);
    if(p.border)document.documentElement.style.setProperty('--border',p.border);
    if(p.bg)document.documentElement.style.setProperty('--cream',p.bg);
    api.settings.set('color_preset',JSON.stringify(p)).catch(()=>{});
  };
  const curColors = colors || (COLOR_PRESETS.length ? COLOR_PRESETS[0] : {primary:'#6f4e37',accent:'#d4a574'});

  const [backups, setBackups] = useState([]);
  const [loadingBk, setLoadingBk] = useState(false);
  const [creatingBk, setCreatingBk] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(null);

  useEffect(() => { loadBackups(); }, []);

  const loadBackups = async () => {
    setLoadingBk(true);
    try { const d = await api.backup.list(); setBackups(Array.isArray(d) ? d : []); }
    catch(e) { setBackups([]); }
    finally { setLoadingBk(false); }
  };

  const createBackup = async () => {
    setCreatingBk(true);
    try { const r = await api.backup.create(); alert(r.message || 'Backup created!'); await loadBackups(); }
    catch(ex) { alert('Backup failed: ' + ex.message); }
    finally { setCreatingBk(false); }
  };

  const doRestore = async () => {
    const fn = restoreConfirm;
    setRestoreConfirm(null);
    try { const r = await api.backup.restore(fn); alert('✅ ' + r.message + '\nRefreshing page...'); setTimeout(() => window.location.reload(), 1500); }
    catch(ex) { alert('Restore failed: ' + ex.message); }
  };

  return <div className="page">
    <div className="page-hd"><h2>🎨 {t.branding}</h2></div>

    <div className="form-card" style={{maxWidth:560}}>
      <h4>☕ App Name</h4>
      <div className="field"><input value={localName} onChange={e => setLocalName(e.target.value)} /></div>
      <button className="btn-primary" onClick={saveName}>Save</button>
    </div>

    <div className="form-card" style={{maxWidth:560}}>
      <h4>🎨 Color Theme</h4>
      <p style={{fontSize:'0.8rem',color:'var(--oat)',marginBottom:'0.75rem'}}>Choose a color preset for the app.</p>
      <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
        {COLOR_PRESETS.map((p,i) =>
          <div key={i} className={'preset-card' + (colors?.primary === p.primary ? ' active' : '')} onClick={() => applyPreset(p)}
            style={{borderColor:colors?.primary === p.primary ? p.primary : 'var(--border)'}}>
            <div style={{display:'flex',gap:4,marginBottom:3,justifyContent:'center'}}>
              {[p.primary,p.accent,p.bg].map((clr,j) => <div key={j} style={{width:20,height:20,borderRadius:4,background:clr,border:'1px solid #ddd'}} />)}
            </div>
            <div style={{fontSize:'0.7rem',color:'var(--oat)',textAlign:'center'}}>{p.icon} {p.name}</div>
          </div>
        )}
      </div>
    </div>

    <div className="alert alert-info" style={{marginTop:'0.75rem'}}>
      Active theme: {curColors.icon} {curColors.name} &mdash; {curColors.desc}
    </div>

    <div className="form-card" style={{maxWidth:560}}>
      <h4 style={{marginBottom:'0.6rem'}}>💾 Database Backups</h4>
      {creatingBk && <p style={{fontSize:'0.8rem',color:'var(--oat)'}}>Creating backup...</p>}
      <button className="btn-primary" onClick={createBackup} disabled={creatingBk}>
        {creatingBk ? '⏳ Creating...' : '📀 Create Backup Now'}
      </button>
      <div style={{marginTop:'0.75rem',maxHeight:260,overflowY:'auto'}}>
        {loadingBk ? <p style={{fontSize:'0.78rem',color:'var(--oat)'}}>Loading backups...</p> :
        !backups.length ? <p style={{fontSize:'0.78rem',color:'var(--oat)'}}>No backups yet.</p> :
        backups.map((bk,i) => {
          const created = new Date(bk.created);
          const sizeStr = bk.size > 1048576 ? (bk.size/1048576).toFixed(1)+' MB' :
                          bk.size > 1024 ? (bk.size/1024).toFixed(1)+' KB' : bk.size+' B';
          return <div key={bk.name} style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            padding:'0.4rem 0.5rem', borderBottom:i<backups.length-1?'1px solid var(--border)':'none',
            fontSize:'0.75rem', flexWrap:'wrap'
          }}>
            <span style={{fontWeight:600,flex:1,minWidth:140}}>📁 {bk.name}</span>
            <span style={{color:'var(--oat)',minWidth:50}}>{sizeStr}</span>
            <span style={{color:'var(--oat)',minWidth:130}}>{created.toLocaleDateString()} {created.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
            <button className="btn-sm" style={{background:'var(--caramel)',color:'#fff',border:'none',padding:'0.2rem 0.6rem',borderRadius:'4px',cursor:'pointer',fontSize:'0.7rem',fontWeight:600}}
              onClick={()=>setRestoreConfirm(bk.name)}>Restore</button>
          </div>;
        })}
      </div>
    </div>

    {restoreConfirm && <div className="modal-bg" onClick={()=>setRestoreConfirm(null)}>
      <div className="ot-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:400}}>
        <h4 style={{marginBottom:'0.5rem'}}>⚠️ Restore Backup</h4>
        <p style={{fontSize:'0.82rem',color:'var(--oat)',marginBottom:'0.75rem',lineHeight:1.5}}>
          This will replace the current database with <strong>{restoreConfirm}</strong>.
          The server will restart — any unsaved data will be lost.
        </p>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn-ghost" style={{flex:1}} onClick={()=>setRestoreConfirm(null)}>Cancel</button>
          <button className="btn-primary" style={{flex:1,background:'var(--red)',borderColor:'var(--red)'}} onClick={doRestore}>
            Yes, Restore
          </button>
        </div>
      </div>
    </div>}
  </div>;
}

export default function App(){
  const[lang,setLang]=useState(()=>localStorage.getItem('cafe_lang')||'en');
  const[globalAppName,setGlobalAppName]=useState(()=>localStorage.getItem('cafe_custom_name')||T.en.appName);
  useEffect(()=>{localStorage.setItem('cafe_lang',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';},[lang]);
  useEffect(()=>{api.settings.get('app_name').then(r=>{if(r.value){setGlobalAppName(r.value);localStorage.setItem('cafe_custom_name',r.value);}}).catch(()=>{});},[]);
  // Load saved theme & logo from server on mount
  useEffect(() => {
    api.settings.get('color_preset').then(r => {
      if (r.value) {
        try {
          const p = JSON.parse(r.value);
          localStorage.setItem('cafe_colors', r.value);
          document.documentElement.style.setProperty('--caramel', p.primary);
          document.documentElement.style.setProperty('--caramel-l', p.accent);
          if (p.dark) document.documentElement.style.setProperty('--espresso', p.dark);
          if (p.medium) document.documentElement.style.setProperty('--dark-wood', p.medium);
          if (p.muted) document.documentElement.style.setProperty('--oat', p.muted);
          if (p.border) document.documentElement.style.setProperty('--border', p.border);
          if (p.bg) document.documentElement.style.setProperty('--cream', p.bg);
        } catch(e) {}
      }
    }).catch(() => {});
  }, []);

  return(<LangCtx.Provider value={{lang,t:T[lang],setLang,appName:globalAppName,setAppName:setGlobalAppName}}>
    <Router><Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/pos"          element={<Guard perm="pos">          <Shell lang={lang} setLang={setLang}><POSPage/></Shell></Guard>}/>
      <Route path="/gaming"       element={<Guard perm="gaming">       <Shell lang={lang} setLang={setLang}><GamingPage/></Shell></Guard>}/>
      <Route path="/orders"       element={<Guard perm="orders_view">  <Shell lang={lang} setLang={setLang}><OrdersPage/></Shell></Guard>}/>
      <Route path="/menu"         element={<Guard perm="menu_view">    <Shell lang={lang} setLang={setLang}><MenuPage/></Shell></Guard>}/>
      <Route path="/inventory"    element={<Guard perm="inventory_view"><Shell lang={lang} setLang={setLang}><InventoryPage/></Shell></Guard>}/>
      <Route path="/customers"   element={<Guard perm="customers">    <Shell lang={lang} setLang={setLang}><CustomersPage/></Shell></Guard>}/>
      <Route path="/tables"       element={<Guard perm="tables_view">  <Shell lang={lang} setLang={setLang}><TablesPage/></Shell></Guard>}/>
      <Route path="/reports"      element={<Guard perm="reports">      <Shell lang={lang} setLang={setLang}><ReportsPage/></Shell></Guard>}/>
      <Route path="/accounting"   element={<Guard perm="accounting">   <Shell lang={lang} setLang={setLang}><AccountingPage/></Shell></Guard>}/>
      <Route path="/employees"    element={<Guard perm="employees">    <Shell lang={lang} setLang={setLang}><EmployeesPage/></Shell></Guard>}/>
      <Route path="/business-day" element={<Guard perm="business_day"> <Shell lang={lang} setLang={setLang}><BusinessDayPage/></Shell></Guard>}/>
      <Route path="/settings" element={<Guard perm="settings"> <Shell lang={lang} setLang={setLang}><SettingsPage/></Shell></Guard>}/>
      <Route path="/" element={<Navigate to="/pos" replace/>}/>
    </Routes></Router>
  </LangCtx.Provider>);}
