const $ = id => document.getElementById(id);

const reports = {
  month: {
    revenue: 125000, customers: 248, invoices: 156, pending: 18500,
    revenueChange: "↑ 12.5%", customerChange: "↑ 8.2%", invoiceChange: "↑ 6.4%",
    values: [18000,22000,16000,28000,25000,32000,27000,39000,34000,42000,38000,50000],
    labels: ["1","3","5","7","9","11","13","15","17","19","21","23"],
    growth: [12,18,15,24,20,30],
    growthLabels: ["Jan","Feb","Mar","Apr","May","Jun"],
    paid:112, unpaid:28, overdue:16
  },
  quarter: {
    revenue: 342000, customers: 682, invoices: 420, pending: 42600,
    revenueChange: "↑ 16.8%", customerChange: "↑ 10.1%", invoiceChange: "↑ 9.2%",
    values: [24000,28000,31000,27000,35000,39000,34000,42000,40000,46000,51000,55000],
    labels: ["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"],
    growth: [38,44,48,52,59,68],
    growthLabels: ["Feb","Mar","Apr","May","Jun","Jul"],
    paid:305, unpaid:78, overdue:37
  },
  year: {
    revenue: 1450000, customers: 2850, invoices: 1840, pending: 92000,
    revenueChange: "↑ 22.4%", customerChange: "↑ 18.5%", invoiceChange: "↑ 14.7%",
    values: [65000,72000,68000,84000,92000,88000,105000,110000,102000,125000,132000,148000],
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    growth: [120,145,160,175,190,225,240,260,275,300,320,355],
    growthLabels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    paid:1320, unpaid:340, overdue:180
  }
};

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function drawRevenue(values, labels) {
  const width = 700, height = 230, max = Math.max(...values) * 1.2;
  const points = values.map((value,index) => ({
    x: index * width / (values.length - 1),
    y: height - (value / max) * (height - 15) - 5
  }));

  const line = points.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  $("chartLine").setAttribute("d",line);
  $("chartArea").setAttribute("d",area);

  const grid = $("chartGrid");
  grid.textContent = "";
  for(let i=0;i<6;i++){
    const y = i*height/5;
    const lineElement = document.createElementNS("http://www.w3.org/2000/svg","line");
    lineElement.setAttribute("x1","0");
    lineElement.setAttribute("x2",width);
    lineElement.setAttribute("y1",y);
    lineElement.setAttribute("y2",y);
    lineElement.setAttribute("stroke","#edf0f5");
    lineElement.setAttribute("stroke-dasharray","4 5");
    grid.appendChild(lineElement);
  }

  const circles = $("chartPoints");
  circles.textContent = "";
  points.forEach(p=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx",p.x);
    circle.setAttribute("cy",p.y);
    circle.setAttribute("r","3.5");
    circle.setAttribute("fill","#3478ed");
    circle.setAttribute("stroke","#fff");
    circle.setAttribute("stroke-width","2");
    circles.appendChild(circle);
  });

  $("xLabels").textContent = "";
  labels.forEach(label=>{
    const span = document.createElement("span");
    span.textContent = label;
    $("xLabels").appendChild(span);
  });

  const top = Math.ceil(max/5);
  $("yLabels").textContent = "";
  for(let i=5;i>=0;i--){
    const span = document.createElement("span");
    span.textContent = "₹"+Math.round(top*i/1000)+"k";
    $("yLabels").appendChild(span);
  }
}

function drawGrowth(values,labels) {
  const container = $("growthChart");
  container.textContent = "";
  const max = Math.max(...values);
  values.forEach((value,index)=>{
    const column = document.createElement("div");
    column.className = "growth-column";
    const bar = document.createElement("div");
    bar.className = "growth-bar"+(index===values.length-1?" current":"");
    bar.style.height = Math.max(4,value/max*100)+"%";
    bar.title = value+" new customers";
    const label = document.createElement("span");
    label.textContent = labels[index];
    column.append(bar,label);
    container.appendChild(column);
  });
}

function renderReport() {
  const data = reports[$("periodFilter").value];
  $("revenue").textContent = money(data.revenue);
  $("customers").textContent = data.customers.toLocaleString("en-IN");
  $("invoices").textContent = data.invoices.toLocaleString("en-IN");
  $("pending").textContent = money(data.pending);
  $("revenueChange").innerHTML = "";
  $("customerChange").innerHTML = "";
  $("invoiceChange").innerHTML = "";

  [["revenueChange",data.revenueChange],["customerChange",data.customerChange],["invoiceChange",data.invoiceChange]].forEach(([id,value])=>{
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = " vs previous period";
    $(id).append(strong,span);
  });

  drawRevenue(data.values,data.labels);
  drawGrowth(data.growth,data.growthLabels);

  $("paidCount").textContent = data.paid;
  $("unpaidCount").textContent = data.unpaid;
  $("overdueCount").textContent = data.overdue;
  const total = data.paid+data.unpaid+data.overdue;
  $("paidBar").style.width = data.paid/total*100+"%";
  $("unpaidBar").style.width = data.unpaid/total*100+"%";
  $("overdueBar").style.width = data.overdue/total*100+"%";
  $("invoiceSummary").textContent = Math.round(data.paid/total*100)+"% of invoices have been paid.";
  $("donut").querySelector("strong").textContent =
    data.revenue>=1000000 ? "₹"+(data.revenue/1000000).toFixed(2)+"M" :
    "₹"+(data.revenue/1000).toFixed(1)+"k";
}

const activities = [
  ["▤","New invoice created","Invoice #INV-0126 · ₹4,500","Today"],
  ["♙","New customer added","A new customer joined your directory","Today"],
  ["▣","Inventory updated","Wireless Headphones stock adjusted","Yesterday"],
  ["✧","Marketing content created","Social media content generated","Yesterday"]
];

activities.forEach(activity=>{
  const item = document.createElement("div");
  item.className = "activity-item";
  const icon = document.createElement("div");
  icon.className = "activity-icon";
  icon.textContent = activity[0];
  const text = document.createElement("div");
  text.className = "activity-text";
  const title = document.createElement("span");
  title.textContent = activity[1];
  const detail = document.createElement("small");
  detail.textContent = activity[2];
  text.append(title,detail);
  const time = document.createElement("span");
  time.className = "activity-time";
  time.textContent = activity[3];
  item.append(icon,text,time);
  $("activityList").appendChild(item);
});

$("periodFilter").addEventListener("change",renderReport);

$("exportBtn").addEventListener("click",()=>{
  const data = reports[$("periodFilter").value];
  const rows = [
    ["Metric","Value"],
    ["Period",$("periodFilter").selectedOptions[0].text],
    ["Revenue",data.revenue],
    ["Customers",data.customers],
    ["Invoices",data.invoices],
    ["Pending Payments",data.pending],
    ["Paid Invoices",data.paid],
    ["Unpaid Invoices",data.unpaid],
    ["Overdue Invoices",data.overdue]
  ];
  const csv = rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nova-business-analytics.csv";
  link.click();
  URL.revokeObjectURL(url);
});

$("menuBtn").addEventListener("click",()=>{
  $("sidebar").classList.toggle("open");
  $("overlay").classList.toggle("show");
});
$("overlay").addEventListener("click",()=>{
  $("sidebar").classList.remove("open");
  $("overlay").classList.remove("show");
});

renderReport();
