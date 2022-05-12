function initialize() {
  if (!localStorage.getItem("ManageYourRoutine")) {
    let json_data = makeJsondata();
  }

  let new_date = new Date().getDate();
  let new_month = new Date().getMonth();
  let new_year = new Date().getFullYear();
  let input_total_state;
  let input_period_year_state;
  let input_period_month_state;
  let input_permonth_state;
  let input_savings_state;
  window.addEventListener("DOMContentLoaded", function () {
    // プルダウンメニューのselect要素を取得
    input_total_state = document.getElementById("input_total");
    input_period_year_state = document.getElementById("input_period_year");
    input_period_month_state = document.getElementById("input_period_month");
    input_permonth_state = document.getElementById("input_permonth");
    input_savings_state = document.getElementById("input_savings");
    input_period_year_state.value = new_year;
    input_period_month_state.value = new_month;

    // イベント「input」を登録
    input_total_state.addEventListener("change", function () {
      calcPerMonth(
        new_month,
        new_year,
        input_period_month_state,
        input_period_year_state,
        input_total_state,
        input_permonth_state
      );
    });
    input_period_year_state.addEventListener("change", function () {
      calcPerMonth(
        new_month,
        new_year,
        input_period_month_state,
        input_period_year_state,
        input_total_state,
        input_permonth_state
      );
    });
    input_period_month_state.addEventListener("change", function () {
      calcPerMonth(
        new_month,
        new_year,
        input_period_month_state,
        input_period_year_state,
        input_total_state,
        input_permonth_state
      );
    });
    input_permonth_state.addEventListener("change", function () {
      calcPeriod(
        new_month,
        new_year,
        input_period_month_state,
        input_period_year_state,
        input_total_state,
        input_permonth_state
      );
    });
    // input_savings_state.addEventListener("change", function () {});
  });

  $("#init-btn").on("click", function () {
    json_data["input_date"] = new_date;
    json_data["input_month"] = new_month;
    json_data["input_year"] = new_year;
    json_data["input_period_month"] = Number(input_period_month_state.value);
    json_data["input_period_year"] = Number(input_period_year_state.value);
    json_data["input_total"] = Number(input_total_state.value);
    json_data["input_permonth"] = Number(input_permonth_state.value);
    json_data["input_savings"] = Number(input_savings_state.value);
    console.log(json_data);
    const jsonString = JSON.stringify(json_data);
    console.log(jsonString);
    localStorage.setItem("ManageYourRoutine", jsonString);
    console.log("click");
  });
}
let today = new Date();
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
let input_date = 0;
let input_month = 0;
let input_year = 0;

let dayHeader = "<tr>";
for (day in days) {
  dayHeader += "<th data-days='" + days[day] + "'>" + days[day] + "</th>";
}
dayHeader += "</tr>";

document.getElementById("thead-month").innerHTML = dayHeader;

monthAndYear = document.getElementById("monthAndYear");
main();

function main() {
  // if (!localStorage.getItem("ManageYourRoutine")) {
    initialize();
    // }
  let json_data = JSON.parse(localStorage.getItem("ManageYourRoutine"));
  reloadPage(json_data);
}

$("#done-btn").on("click", function () {
  console.log("click");
  // TODO: 1日1回しか押せないようにする
  // TODO: もしくは、計算して何回推してもjsonを更新するだけにする
  flgDone();
});

function reloadPage(json_data) {
  showCalendar(currentMonth, currentYear);
  console.log(json_data);
  console.log(json_data["input_checked"]);
  input_checked = json_data["input_checked"];
  input_date = json_data["input_date"];
  input_month = json_data["input_month"];
  input_year = json_data["input_year"];
  input_checked = adjastOnOff(
    input_checked,
    input_date,
    input_month,
    input_year
  );
  let tmp_year = input_year;
  let tmp_month = input_month;
  let tmp_date = input_date;
  for (let i = 0; i < input_checked.length; i++) {
    if (i % 2 == 0) {
      for (let j = 0; j < input_checked[i]; j++) {
        // オン
        dayOn(tmp_year, tmp_month, tmp_date);
      }
    } else {
      for (let j = 0; j < input_checked[i]; j++) {
        // オフ
        dayOff(tmp_year, tmp_month, tmp_date);
      }
    }
  }
}

// TODO: input_checkedを変える
function flgDone() {}

// 該当の日付のbcgを変化させるcssを反映させる
function dayOn(year, month, date) {}

function dayOff(year, month, date) {}

function makeJsondata() {
  const json_data = {
    input_date: 0,
    input_month: 0,
    input_year: 0,
    input_period_month: 0,
    input_period_year: 0,
    input_total: 0,
    input_permonth: 0,
    input_savings: 0,
    input_checked: [],
  };
  const jsonString = JSON.stringify(json_data);
  localStorage.setItem("ManageYourRoutine", jsonString);
  return json_data;
}

function adjastOnOff(input_checked, input_date, input_month, input_year) {
  // console.log(input_checked);
  let total = input_checked.reduce((sum, element) => sum + element, 0);
  let date1 = new Date(input_year, input_month + 1, input_date);
  let date2 = new Date();
  let diff_date = Math.ceil(date2 - date1) / 86400000;

  if (diff_date > total) {
    if (input_checked.length % 2 == 0) {
      input_checked[input_checked.length - 1] += diff_date - total;
    } else {
      input_checked.push(diff_date - total);
    }
  } else {
  }
  return input_checked;
}

function calcOnOff(input_checked) {
  if (input_checked.length % 2 == 0) {
    input_checked.push(1);
  } else {
    input_checked[input_checked.length - 1]++;
  }
  return input_checked;
}

function calcBetweenMonths(month1, year1, month2, year2) {
  let tmp = (year2 - year1) * 12 + month2 - month1;
  if (tmp > 0) {
    return (year2 - year1) * 12 + month2 - month1;
  } else {
    alert("過去の月が設定されています");
    return 1;
  }
}

function calcPriodYearMonth(month, year, diff) {
  let diff_year = Math.floor(diff / 12);
  let diff_month = Math.ceil(diff - diff_year * 12);
  diff_year += Math.floor((month + diff_month) / 12);
  diff_month = ((month + diff_month) % 12) - 1;
  return [year + diff_year, diff_month];
}

function calcPerMonth(
  input_month,
  input_year,
  input_period_month_state,
  input_period_year_state,
  input_total_state,
  input_permonth_state
) {
  let tmp = calcBetweenMonths(
    input_month,
    input_year,
    Number(input_period_month_state.value) + 1,
    Number(input_period_year_state.value)
  );
  let tmp2 = Math.ceil(Number(input_total_state.value) / tmp / 1000) * 1000;
  input_permonth_state.value = tmp2;
}

function calcPeriod(
  input_month,
  input_year,
  input_period_month_state,
  input_period_year_state,
  input_total_state,
  input_permonth_state
) {
  let tmp =
    Number(input_total_state.value) / Number(input_permonth_state.value);
  [input_period_year_state.value, input_period_month_state.value] =
    calcPriodYearMonth(input_month, input_year, tmp);
}

function calcThisMonthChecked(year, month) {
  start_month = new Date(year, month, 1);
  input_start = new Date(input_year, input_month, input_date);
  skip_days = (start_month - input_start) / 86400000;
  let tmp = 0;
  for (let i = 0; i < input_checked.length; i++) {
    tmp += input_checked[i];
    if (tmp > skip_days) {
    }
  }
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
  currentYear = parseInt(selectYear.value);
  currentMonth = parseInt(selectMonth.value);
  showCalendar(currentMonth, currentYear);
}

function showCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();

  tbl = document.getElementById("calendar-body");

  tbl.innerHTML = "";

  monthAndYear.innerHTML = year + "年 " + months[month];
  selectYear.value = year;
  selectMonth.value = month;

  // creating all cells
  let date = 1;

  let this_month_checked = calcThisMonthChecked();

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
