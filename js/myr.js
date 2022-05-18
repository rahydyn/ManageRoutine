import {
  envApiKey,
  envAuthDomain,
  envProjectId,
  envStorageBucket,
  envMessagingSenderId,
  envAppId,
} from "../js/sdk-id.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
  child,
  get,
  onChildChanged,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  projectId: envProjectId,
  storageBucket: envStorageBucket,
  messagingSenderId: envMessagingSenderId,
  appId: envAppId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
//
const dbRef = ref(db, "manageyourroutine/user_data");

// define global variables
let cell;
let cellText;
let userRef;
let json_data;

let input_total_state = document.getElementById("input_total");
let input_period_year_state = document.getElementById("input_period_year");
let input_period_month_state = document.getElementById("input_period_month");
let input_permonth_state = document.getElementById("input_permonth");
let input_savings_state = document.getElementById("input_savings");

let today = new Date();
let currentDate = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");

let createYear = generate_year_range(2022, 2070);

document.getElementById("year").innerHTML = createYear;
document.getElementById("input_period_year").innerHTML = createYear;

let calendar = document.getElementById("calendar");
let lang = calendar.getAttribute("data-lang");

let months = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];
let days = ["日", "月", "火", "水", "木", "金", "土"];

let input_checked = [];

let dayHeader = "<tr>";
for (let i; i < days.length; i++) {
  dayHeader += "<th data-days='" + days[i] + "'>" + days[i] + "</th>";
}
dayHeader += "</tr>";

document.getElementById("thead-month").innerHTML = dayHeader;
let monthAndYear = document.getElementById("monthAndYear");

// localStorageのデータがある場合=再アクセスの場合
if (localStorage.getItem("ManageYourRoutine")) {
  $("#init").hide(); //最初の画面を非表示にする
  $(".main").show(); //次の画面を表示する
}

// 登録ボタン
$("#init-btn").on("click", function () {
  $("#init").hide(); //最初の画面を非表示にする
  $(".main").show(); //次の画面を表示する
});

// 修正ボタン
$("#edit-btn").on("click", function () {
  //ボタンがクリックされたら下記の処理を実行
  $("#init").show(); //最初の画面を非表示にする
  $(".main").hide(); //次の画面を表示する
  input_total_state.value = json_data.input_total;
  input_period_year_state.value = json_data.input_period_year;
  input_period_month_state.value = json_data.input_period_month;
  input_permonth_state.value = json_data.input_permonth;
  input_savings_state.value = json_data.input_savings;
});

// doneボタン
$("#done-btn").on("click", function () {
  console.log("click");
  // TODO: 1日1回しか押せないようにする
  // TODO: もしくは、計算して何回押してもjsonを更新するだけにする
  flgDone();
});

$("#previous").on("click", function () {
  previous();
});
$("#next").on("click", function () {
  next();
});
$("#year").on("change", function () {
  jump();
});
$("#month").on("change", function () {
  jump();
});

window.addEventListener("DOMContentLoaded", function () {
  // プルダウンメニューのselect要素を取得

  // if (!json_data) {
  //   input_period_year_state.value = new Date().getFullYear();
  //   input_period_month_state.value = new Date().getMonth();
  // }
  input_period_year_state.value = currentYear;
  input_period_month_state.value = currentMonth;

  let input_year = new Date().getFullYear();
  let input_month = new Date().getMonth();
  let input_date = new Date().getDate();

  // イベント「input」を登録
  input_total_state.addEventListener("change", function () {
    calcPerMonth();
    console.log("changed total!");
  });
  input_period_year_state.addEventListener("change", function () {
    calcPerMonth();
    console.log("changed year!");
  });
  input_period_month_state.addEventListener("change", function () {
    calcPerMonth();
    console.log("changed month!");
  });
  input_permonth_state.addEventListener("change", function () {
    calcPeriod();
    console.log("changed per month!");
  });
  // input_savings_state.addEventListener("change", function () {});

  $("#init-btn").on("click", function () {
    json_data.input_date = new Date().getDate();
    json_data.input_month = new Date().getMonth();
    json_data.input_year = new Date().getFullYear();
    json_data.input_period_month = Number(input_period_month_state.value);
    json_data.input_period_year = Number(input_period_year_state.value);
    json_data.input_total = Number(input_total_state.value);
    json_data.input_permonth = Number(input_permonth_state.value);
    json_data.input_savings = Number(input_savings_state.value);
    set(userRef, json_data);
    console.log("click");
  });

  function calcBetweenMonths(month1, year1, month2, year2) {
    let tmp = (year2 - year1) * 12 + month2 - month1;
    if (tmp > 0) {
      return tmp; // 差分の月数を返します。
    } else {
      alert("過去の月が設定されています");
      return 1;
    }
  }

  function calcPerMonth() {
    let tmp = calcBetweenMonths(
      input_month,
      input_year,
      Number(input_period_month_state.value) + 1,
      Number(input_period_year_state.value)
    );
    let tmp2 = Math.ceil(Number(input_total_state.value) / tmp / 1000) * 1000;
    input_permonth_state.value = tmp2;
  }

  function calcYearMonth(month, year, diff) {
    let diff_year = Math.floor(diff / 12);
    let diff_month = diff % 12;
    if (diff_month + month > 12) {
      diff_month = diff_month + month - 12;
      diff_year += 1;
    }
    return [year + diff_year, month + diff_month];
  }

  function calcPeriod() {
    let tmp =
      Number(input_total_state.value) / Number(input_permonth_state.value);
    [input_period_year_state.value, input_period_month_state.value] =
      calcYearMonth(input_month, input_year, tmp);
    console.log([
      input_period_year_state.value,
      input_period_month_state.value,
    ]);
  }
});

main();

async function initialize() {
  let init_json_data;
  if (!localStorage.getItem("ManageYourRoutine")) {
    init_json_data = makeJsondata();
    userRef = push(dbRef); //ユニークKEYを生成
    console.log(userRef.key);
    const tmp = {
      key: userRef.key,
    };
    const jsonString = JSON.stringify(tmp);
    localStorage.setItem("ManageYourRoutine", jsonString);
    return init_json_data;
  } else {
    let user_key = JSON.parse(localStorage.getItem("ManageYourRoutine")).key;
    console.log(user_key);
    userRef = ref(db, "manageyourroutine/user_data/" + user_key);
    // onChildAdded(userRef, (snapshot) => {
    //   console.log("onChildAdded");
    //   json_data = snapshot.val();
    //   console.log(json_data);
    // });

    init_json_data = await get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return init_json_data;
  }
}

function makeJsondata() {
  const json_data = {
    input_date: currentDate,
    input_month: currentMonth,
    input_year: currentYear,
    updated_date: 0,
    updated_month: 0,
    updated_year: 0,
    input_period_month: 0,
    input_period_year: 0,
    input_total: 0,
    input_permonth: 0,
    input_savings: 0,
    input_checked: [true],
  };
  return json_data;
}

function main() {
  const promise = new Promise((resolve) => {
    let tmp = initialize();
    tmp.then(function (value) {
      json_data = value;
      set(userRef, json_data);
      resolve();
    });
  })
    .then(() => {
      console.log("start");
    })
    .then(() => {
      reloadPage();
    });
}

function reloadPage() {
  showCalendar(currentMonth, currentYear);
  console.log("reload");
  json_data.input_checked = adjastOnOff(json_data);
  set(userRef, json_data);
  for (let i = 0; i < json_data.input_checked.length; i++) {
    if (json_data.input_checked[i] == true) {
      dayOn();
    } else {
      dayOff();
    }
  }
}

// TODO: input_checkedを変える
function flgDone() {
  const start_date = new Date(
    json_data.input_year,
    json_data.input_month,
    json_data.input_date
  );
  const diff_days = Math.ceil((today - start_date) / 86400000);
  const unchecked_days = diff_days - json_data.input_checked.length;
  console.log("diff_days");
  console.log(diff_days);
  console.log(json_data.input_checked.length);
  console.log(unchecked_days);
  console.log("unchecked_days");
  if (!json_data.input_checked) {
    json_data.input_checked = [true];
    set(userRef, json_data);
  } else if (unchecked_days == 0) {
    alert("ボタンは1日1回までだよ怒");
  } else if (unchecked_days == 1) {
    json_data.input_checked.push(true);
    set(userRef, json_data);
  }
}

// 該当の日付のbcgを変化させるcssを反映させる
function dayOn(json_data) {}

function dayOff(json_data) {}

function adjastOnOff(json_data) {
  // check correct length
  const start_date = new Date(
    json_data.input_year,
    json_data.input_month,
    json_data.input_date
  );
  const diff_days = Math.ceil((today - start_date) / 86400000);
  const unchecked_days = diff_days - json_data.input_checked.length - 1;
  if (unchecked_days > 0) {
    for (let i = 0; i < unchecked_days; i++) {
      json_data.input_checked.push(false);
    }
    console.log("adjast input_checked");
  } else if (unchecked_days == 0) {
    console.log("no need to adjast input_checked");
  } else {
    console.log("エラー：データが多いです");
    json_data.input_checked = json_data.input_checked.slice(
      0,
      json_data.input_checked.length + unchecked_days + 1
    );
    console.log("json_data.input_checked");
    console.log(json_data.input_checked);
  }
  return json_data.input_checked;
}

// function adjastOnOffByRLE(input_checked, input_date, input_month, input_year) {
//   // console.log(input_checked);
//   let total = input_checked.reduce((sum, element) => sum + element, 0);
//   let date1 = new Date(input_year, input_month + 1, input_date);
//   let date2 = new Date();
//   let diff_date = Math.ceil(date2 - date1) / 86400000;

//   if (diff_date > total) {
//     if (input_checked.length % 2 == 0) {
//       input_checked[input_checked.length - 1] += diff_date - total;
//     } else {
//       input_checked.push(diff_date - total);
//     }
//   } else {
//   }
//   return input_checked;
// }

// function calcRLE(input_checked) {
//   if (input_checked.length % 2 == 0) {
//     input_checked.push(1);
//   } else {
//     input_checked[input_checked.length - 1]++;
//   }
//   return input_checked;
// }

function calcThisMonthChecked(year, month) {
  const start_month = new Date(year, month, 1);
  const input_start = new Date(
    json_data.input_year,
    json_data.input_month,
    json_data.input_date
  );
  let skip_days = (start_month - input_start) / 86400000;
  console.log("skip_days");
  console.log(skip_days);
  let tmp = [];
  if (skip_days < 0) {
    for (let i = skip_days; i < 0; i++) {
      tmp.push(false);
    }
    for (let i = 0; i < currentDate + skip_days; i++) {
      console.log(i);
      console.log(json_data.input_checked);
      if (json_data.input_checked[i] == true) {
        tmp.push(true);
      } else {
        tmp.push(false);
      }
    }
  } else {
    for (let i = skip_days; i < skip_days + currentDate; i++) {
      if (json_data.input_checked[i] == true) {
        tmp.push(true);
      } else {
        tmp.push(false);
      }
    }
  }
  return tmp;
}
//
//
//
//

//
//
//
function generate_year_range(start, end) {
  let years = "";
  for (let year = start; year <= end; year++) {
    years += "<option value='" + year + "'>" + year + "</option>";
  }
  return years;
}

function next() {
  currentYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  currentMonth = (currentMonth + 1) % 12;
  showCalendar(currentMonth, currentYear);
}

function previous() {
  currentYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  showCalendar(currentMonth, currentYear);
}

function jump() {
  console.log(selectYear.value);
  currentYear = parseInt(selectYear.value);
  currentMonth = parseInt(selectMonth.value);
  showCalendar(currentMonth, currentYear);
}

$("#move-this_month").on("click", function () {
  showCalendar(today.getMonth(), today.getFullYear());
});

function showCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();

  let tbl = document.getElementById("calendar-body");

  tbl.innerHTML = "";

  monthAndYear.innerHTML = year + "年 " + months[month];
  selectYear.value = year;
  selectMonth.value = month;

  // creating all cells
  let date = 1;
  console.log("this_month_checked");
  console.log(json_data);
  console.log("this_month_checked");
  let this_month_checked = calcThisMonthChecked(year, month);
  console.log("this_month_checked");
  console.log(this_month_checked);
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        cell = document.createElement("td");
        cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth(month, year)) {
        break;
      } else {
        cell = document.createElement("td");
        cell.setAttribute("data-date", date);
        cell.setAttribute("data-month", month + 1);
        cell.setAttribute("data-year", year);
        cell.setAttribute("data-month_name", months[month]);
        cell.className = "date-picker";
        cell.innerHTML = "<span>" + date + "</span>";
        // TODO: 完了されている日は変化させる
        if (this_month_checked[date - 1] == true) {
          cell.className = "date-picker checked";
        }

        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          cell.className = "date-picker selected";
          // TODO: 完了ボタン入れる
        }
        row.appendChild(cell);
        date++;
      }
    }

    tbl.appendChild(row);
  }
}

function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}
