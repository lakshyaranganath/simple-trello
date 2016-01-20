var trello = (function () {
  var id = 0;
  var lists = [];
  var $listsContainer;

  function init () {
    cacheDOM();
    bindListeners();
    render();
  }

  function cacheDOM () {
    $listsContainer = document.getElementById('lists-container');
  }

  function bindListeners () {
    var $addList = document.getElementById('add-list');
    $addList.addEventListener('click', addList);
  }

  function addList () {
    var listName = window.prompt('Enter list name', '');
    if (listName) {
      var list = {
        name: listName,
        cards: []
      };
      lists.push(list);
      render();
    }
  }

  function addCard (e) {
    var cardText = window.prompt('Enter card text', '');
    if (cardText) {
      var $list = e.currentTarget.parentNode;
      var listName = $list.dataset.listName;
      var card = {
        id: id++,
        text: cardText
      };
      lists.forEach(function (list) {
        if (list.name === listName) {
          list.cards.push(card);
        }
      });
      render();
    }
  }

  function render () {
    $listsContainer.innerHTML = '';
    lists.forEach(function (list) {
      createListElement(list);
    });
  }

  function createListElement (list) {
    var $listName = document.createElement('h3');
    $listName.innerHTML = list.name + ' +';
    $listName.addEventListener('click', addCard);

    var $list = document.createElement('div');
    $list.dataset.listName = list.name;
    $list.classList.add('list');
    $list.appendChild($listName);
    $list.addEventListener('dragover', dragOver);
    $list.addEventListener('dragleave', dragLeave);
    $list.addEventListener('drop', cardDropped);

    appendCardsToList(list.cards, $list);
    $listsContainer.appendChild($list);

    function dragOver (e) {
      e.preventDefault();
      var $list = e.currentTarget;
      $list.classList.add('drag-over');
    }

    function dragLeave (e) {
      e.preventDefault();
      var $list = e.currentTarget;
      $list.classList.remove('drag-over');
    }

    function cardDropped (e) {
      e.preventDefault();
      var $destinationList = e.currentTarget;
      $destinationList.classList.remove('drag-over');
      var destinationListName = $destinationList.dataset.listName;
      var transferData = JSON.parse(e.dataTransfer.getData('transferData'));
      var sourceListName = transferData.sourceListName;
      console.log('cardDropped', sourceListName, destinationListName, transferData.transferCard);
      if (sourceListName !== destinationListName) {
        moveCard(sourceListName, destinationListName, transferData.transferCard);
      }
    }
  }

  function appendCardsToList (cards, $list) {
    cards.forEach(function (card) {
      var $card = createCardElement(card);
      $list.appendChild($card);
    });
  }

  function createCardElement (card) {
    var $card = document.createElement('div');
    $card.innerHTML = card.text;
    $card.classList.add('card');
    $card.draggable = true;
    $card.addEventListener('dragstart', function (e) {
      dragStart(e, card);
    });
    return $card;

    function dragStart (e, card) {
      var $card = e.currentTarget;
      var $list = $card.parentNode;
      var transferData = {
        transferCard: card,
        sourceListName: $list.dataset.listName
      };
      e.dataTransfer.setData('transferData', JSON.stringify(transferData));
    }
  }

  function moveCard (sourceListName, destinationListName, transferCard) {
    lists.forEach(function (list) {
      if (list.name === sourceListName) {
        list.cards = list.cards.filter(function (card) {
          return card.id !== transferCard.id;
        });
      } else if (list.name === destinationListName) {
        list.cards.push(transferCard);
      }
    });
    render();
  }

  return {
    init: init
  };
})();

trello.init();
