import{A as f,B as d,C as g,K as O,N as B,P as R,R as o,S as D,T as a,X as L,Z as v,_ as w,j as I,l as S,n as M,q as b,r as $,t as P,v as C,x as W,y}from"./chunks/event-handler.browser-DWFwA0wH.js";import{t as k}from"./chunks/toggle-theme-RvHmAZZa.js";import"./chunks/utils-DWvyLWMI.js";var x=W(`<p class="theme-icon svelte-15efw8h"> </p> <div class="container svelte-15efw8h"><h3 class="svelte-15efw8h">Prisma Installation Part Two</h3> <pre class="svelte-15efw8h">
  By selecting the continue button the extension will issue the final commands 
  for installing Prisma ORM; otherwise you can enter the following commands yourself 
  DBNAME="MyDBNAME" # your database name 
  DBOWNER='JohnDoe' # the name of the database owner
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DBNAME;" 
  
  createdb "$DBNAME" -U "$DBOWNER" 
  "GRANT ALL ON SCHEMA public TO $DBOWNER; GRANT CONNECT ON DATABASE $DBNAME TO $DBOWNER;" 
  sudo -u postgres psql -d "$DBNAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DBOWNER; 
  ALTER SCHEMA public OWNER TO $DBOWNER; ALTER DATABASE dbtest OWNER TO $DBOWNER;" 
  sudo -u postgres psql -d "$DBNAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA
  public GRANT ALL ON TABLES TO $DBOWNER; ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO $DBOWNER;"

  pnpx prisma migrate dev --name init  # create first migration (when ready)
  pnpx prisma generate
  
  <button id="installPartTwoBtnId" class="svelte-15efw8h"> Continue </button><button id="cancelPartTwoBtnId" class="svelte-15efw8h">Cancel</button>
</pre></div>`,1);function G(E,m){b(m,!0);function h(t,r){M.postMessage({command:t,payload:r})}let i=null,e=d("light"),c=d(!1);function s(){document.documentElement.classList.add(a(e))}function l(){document.documentElement.classList.remove(a(e)),o(e,a(e)==="dark"?"light":"dark",!0),localStorage.setItem("theme",a(e)),s()}I(()=>{if(!a(c))return;const t=window.matchMedia("(prefers-color-scheme: dark)"),r=N=>{localStorage.getItem("theme")||(o(e,N.matches?"dark":"light",!0),s())};return t.addEventListener("change",r),()=>t.removeEventListener("change",r)});function p(){return a(e)==="dark"?"☀️":"🌙"}$(()=>{i=P("installPartTwoBtnId"),i?.addEventListener("click",()=>{h("installPrismaPartTwo")}),o(e,k(),!0),s(),l(),o(c,!0)});var A={applyTheme:s,toggleTheme:l},u=x(),n=R(u);S(n,"aria-hidden",!0);var T=B(n,!0);return v(n),L(2),f(t=>C(T,t),[()=>p()]),g("click",n,()=>l()),y(E,u),O(A)}D(["click"]);w(G,{target:document.getElementById("app")});

//# sourceMappingURL=OrmTwo-DtvWvOC0.js.map