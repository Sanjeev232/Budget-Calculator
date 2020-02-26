///////////////////////////////////BUDGET CONTROLLER/////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

let budgetController = (() => {
  //////function constructor for expense////private function for budgetController module

  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  //Prototype for calculate percentage

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  //Prototype for get percentage value

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  //////function constructor for income////private function for budgetController module

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(cur => {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  ////Perfect data structure for expense and income

  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      //ID = lastID + 1;
      // Create new ID

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item based on 'inc' or 'exp' type

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it into data structure

      data.allItems[type].push(newItem);

      // Return the new element

      return newItem;
    },

    deleteItem: (type, id) => {
      let ids, index;

      ids = data.allItems[type].map(current => {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      //1. Calculate total income & expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //2. Calculate the budget : income-expenses

      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
    },

    calculatePercentages: () => {
      /* a = 20;
       b = 10;
       c= 70;
       income = 100;
       a = 20/100 = 20%
       b= 10/100 = 10%
       */

      data.allItems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: () => {
      let allPerc = data.allItems.exp.map(cur => {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
    //for testing only

    // testing: () => {
    //   console.log(data);
    // }
  };
})();

////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// UI CONTROLLER/////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

let UIController = (() => {
  //central place for all html string selection
  let domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = (num, type) => {
    let numSplit, int, dec;

    /*
      + or - before number
     exactly 2 decimal points
    comma separating the thousands
     2310.4567 ---> + 2,310.46
     2000 ---> + 2,000.00
  */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); //input 23510, output 23,510
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(domStrings.inputType).value, //will be either inc or exp
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      //1. crate html string with placeholder text
      let html, newHtml, element;
      if (type === "inc") {
        element = domStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      } else if (type === "exp") {
        element = domStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //2. replace placeholder text with final data

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //3. Insert the HTML into Dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: selectorId => {
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    //Clear input fields & focus back to first item

    clearFields: () => {
      let fields, fieldsArray;
      fields = document.querySelectorAll(
        domStrings.inputDescription + ", " + domStrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },
    displayBudget: obj => {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        domStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent =
          obj.percentage + " %";
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      let fields;

      fields = document.querySelectorAll(domStrings.expensesPercentageLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "----";
        }
      });
    },

    displayMonth: () => {
      let now, months, month, year;

      now = new Date();

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(domStrings.dateLabel).textContent =
        months[month] + "," + " " + year;
    },

    changedType: () => {
      let fields = document.querySelectorAll(
        domStrings.inputType +
          "," +
          domStrings.inputDescription +
          "," +
          domStrings.inputValue
      );

      nodeListForEach(fields, cur => {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(domStrings.inputButton).classList.toggle("red");
    },

    getDomStrings: () => {
      return domStrings;
    }
  };
})();

///////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////GLOBAL APP CONTROLLER/////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

let controller = ((budgetCtrl, UICtrl) => {
  let setUpEventListeners = () => {
    let Dom = UICtrl.getDomStrings();
    document
      .querySelector(Dom.inputButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(Dom.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(Dom.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  let updateBudget = () => {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    let budget;
    budget = budgetCtrl.getBudget();

    //3. Display the budget in the UI
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = () => {
    //1. calculate the percentages

    budgetCtrl.calculatePercentages();

    //2. Read percentages from the budgetController

    let percentages = budgetCtrl.getPercentage();

    // 3. Update the UI with the new percentages

    UICtrl.displayPercentages(percentages);
  };

  let ctrlAddItem = () => {
    let input, newItem;

    //1. get the input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Add the item to UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. Calculate & update the percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = event => {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete item from DataStructure
      budgetCtrl.deleteItem(type, ID);

      //2. delete item from ui
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Calculate & update the percentages
      updatePercentages();
    }
  };

  return {
    init: () => {
      console.log("application has started made by Sanjeev Singh");

      UICtrl.displayMonth();

      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setUpEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
