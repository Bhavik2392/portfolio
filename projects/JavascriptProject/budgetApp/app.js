// BUDGET CONTROLLER
var budgetController = (function () {
  //Constructor for expense
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  //Constructor for Income
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
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
    addItem: function (type, des, val) {
      var newItem;

      //ID = last ID + 1
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item based on 'inc' or  'exp'
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //push it into our data structure
      data.allItems[type].push(newItem);

      //return the new item or element
      return newItem;
    },
    deleteItem: function (type, id) {
      //id = 6
      //data.allItems[type][id]
      //ids = [1 2 4 6 8 ]
      //index = 3
      var ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // Calculate the buget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      /*
      a=20
      b=10
      c=40
      income = 100
      a= 20/100 = 20% 
      */
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function () {
      console.log(data);
    }
  };
})();



// UI CONTROLLER
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec, type;
    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands
    
    2310.4567 -> + 2,310.46
    2000 -> + 2,000.00
    */

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length); //input 2310, output 2,310
    }
    dec = numSplit[1];
    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either Inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml;
      // Create HTML String with placeholder tag
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replace the placholder with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      //Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + " , " + DOMStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);



      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function () {
      var now, year, month, months;
      now = new Date();
      //var christmas = new Date(2016,11,25)
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
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue);

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      })
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
    getDOMStrings: function () {
      return DOMStrings;
    }
  };
})();





// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
  };

  var updateBudget = function () {
    // 1. Calculate the Budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate Percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3 . Update the UI with new percentage
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the buget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4.  Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and Update Budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };
  var ctrlDeleteItem = function (event) {
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from he UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
