import{A as $,B as S,C,F as a,I as q,K as A,N as s,R as h,S as J,T as l,X as i,Z as n,_ as K,c,j as Q,l as U,n as W,q as X,r as Z,s as m,v as G,x as V,y as Y}from"./chunks/event-handler.browser-DWFwA0wH.js";import{t as ee}from"./chunks/toggle-theme-RvHmAZZa.js";var te=V(`<div class="theme-container svelte-z2mirn"><p class="theme-icon svelte-z2mirn"> </p> <div class="container svelte-z2mirn"><pre id="installPartOneId" class="svelte-z2mirn">
      <h3 class="svelte-z2mirn">Prisma Installation Part One</h3>
The Extension 'Create CRUD Form Support' found that Prisma ORM is not installed in
the project; it can help with installing it. In the first part of the installation
it will add all the necessary packages and instantiate Prisma in this project by
installing a very basic schema in /prisma/schema.prisma file at the project's root.
  <div class="dbname-block svelte-z2mirn">
    <label for="dbNameId" class="svelte-z2mirn">
      Database Name
      <br class="svelte-z2mirn"/><input type="text" placeholder="avoid dashes in db-name" class="svelte-z2mirn"/>
    </label>
    <label for="dbOwnerId" class="svelte-z2mirn">
      Database Owner
      <br class="svelte-z2mirn"/><input type="text" class="svelte-z2mirn"/>
    </label>
    <label for="dbOwnerPasswordId" class="svelte-z2mirn">
      Owner's Password
      <br class="svelte-z2mirn"/><input type="password" class="svelte-z2mirn"/>
    </label>
    <label for="dbHostId" class="svelte-z2mirn">
      Host Name
      <br class="svelte-z2mirn"/><input type="string" class="svelte-z2mirn"/>
    </label>
    <label for="dbPortId" class="svelte-z2mirn">
      Communication Port
      <br class="svelte-z2mirn"/><input type="number" class="svelte-z2mirn"/>
    </label>
  </div>

By specifying database name, database owner name and owner's password the Extension will
set the database connection string in the .env file and install with no interaptions.
It will open schema.prisma and .env contents in separate windows and a continue button, 
waiting for you to 
  -  Specify your Prisma models/tables replacing the current schema.prisma content
  -  Specify the connection string in the opened .env file if not set by the Extension
When you are done select the continue button to finish the installation.
If you prefer to close the Extension, in order to finish the above tasks, you could
restart the Extension after that and it will display the commands that you should
enter yourself or to select the continue button to allow the Extension to finish the 
installation.

  <button style="margin-left:4rem;" class="svelte-z2mirn">Install Prisma ORM</button><button id="cancelPartOneBtnId" class="svelte-z2mirn">Cancel</button>
</pre></div></div>`);function ae(T,N){X(N,!0);function R(t,p){W.postMessage({command:t,payload:p})}let e=q({name:"dbrony",owner:"rony",password:"rony",host:"localhost",port:5432});function j(){if(e.name&&e.owner&&e.password){const t={name:e.name,owner:e.owner,password:e.password,host:e.host??"localhost",port:e.port??"5432"};R("installPrismaPartOne",JSON.stringify(t))}}let r=S("light"),z=S(!1);function d(){document.documentElement.classList.add(l(r))}function u(){document.documentElement.classList.remove(l(r)),h(r,l(r)==="dark"?"light":"dark",!0),localStorage.setItem("theme",l(r)),d()}Q(()=>{if(!l(z))return;const t=window.matchMedia("(prefers-color-scheme: dark)"),p=H=>{localStorage.getItem("theme")||(h(r,H.matches?"dark":"light",!0),d())};return t.addEventListener("change",p),()=>t.removeEventListener("change",p)});function B(){return l(r)==="dark"?"☀️":"🌙"}Z(()=>{h(r,ee(),!0),d(),u(),h(z,!0)});var L={applyTheme:d,toggleTheme:u},v=te(),o=s(v);U(o,"aria-hidden",!0);var D=s(o,!0);n(o);var _=a(o,2),I=s(_),b=a(s(I),3),f=a(s(b)),O=a(s(f),2);c(O),i(),n(f);var w=a(f,2),P=a(s(w),2);c(P),i(),n(w);var g=a(w,2),x=a(s(g),2);c(x),i(),n(g);var y=a(g,2),k=a(s(y),2);c(k),i(),n(y);var E=a(y,2),M=a(s(E),2);c(M),i(),n(E),i(),n(b);var F=a(b,2);return i(2),n(I),n(_),n(v),$(t=>G(D,t),[()=>B()]),C("click",o,()=>u()),m(O,()=>e.name,t=>e.name=t),m(P,()=>e.owner,t=>e.owner=t),m(x,()=>e.password,t=>e.password=t),m(k,()=>e.host,t=>e.host=t),m(M,()=>e.port,t=>e.port=t),C("click",F,j),Y(T,v),A(L)}J(["click"]);K(ae,{target:document.getElementById("app")});

//# sourceMappingURL=OrmOne-BXpioc4V.js.map