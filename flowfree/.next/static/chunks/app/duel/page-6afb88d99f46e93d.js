(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[958],{673:function(e,n,t){Promise.resolve().then(t.bind(t,4734))},7168:function(e,n,t){"use strict";var o=t(9099),r=t(9291);let c=(0,o.Ue)()((0,r.tJ)(e=>({board1:[],board2:[],updateBoard1:n=>e({board1:n}),updateBoard2:n=>e({board2:n}),cellColor:[],updateColor:n=>e({cellColor:n})}),{name:"",getStorage:()=>localStorage}));n.Z=c},4734:function(e,n,t){"use strict";t.r(n);var o=t(7437),r=t(2265),c=t(6463),a=t(7168),d=t(5145);n.default=()=>{let e=(0,c.useRouter)(),n=(0,a.Z)(e=>e.updateBoard1),t=(0,a.Z)(e=>e.updateBoard2),u=(0,a.Z)(e=>e.updateColor),[s,i]=(0,r.useState)(!1),[l,f]=(0,r.useState)("N/A");return(0,r.useEffect)(()=>{let o=localStorage.getItem("userId");function r(){i(!0),f(d.W.io.engine.transport.name),d.W.io.engine.on("upgrade",e=>{f(e.name)}),d.W.emit("joinQueue",o)}function c(){i(!1),f("N/A")}return o||(o=(1e3*Math.random()).toString(),localStorage.setItem("userId",o)),d.W.connected&&r(),d.W.on("connect",r),d.W.on("matched",function(o){console.log("client",o),n(o.Board),t(o.Board),u(o.Color),console.log("updating"),e.push("/duel/".concat(o.Game))}),d.W.on("disconnect",c),()=>{d.W.off("connect",r),d.W.off("disconnect",c)}},[]),(0,o.jsx)(o.Fragment,{children:(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{children:"Waiting for a match..."}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("p",{children:["Status: ",s?"connected":"disconnected"]}),(0,o.jsxs)("p",{children:["Transport: ",l]})]})]})})}},5145:function(e,n,t){"use strict";t.d(n,{W:function(){return o}});let o=(0,t(4999).io)("https://flowfreeserver.onrender.com")}},function(e){e.O(0,[870,374,971,23,744],function(){return e(e.s=673)}),_N_E=e.O()}]);