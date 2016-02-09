/////////////////////////
/* UPDATE FUNCTIONS */
/////////////////////////


sortComputerCards = function(cards) {
  var cardsSwitched = 0;
  do {
    cardsSwitched = 0;
    for (var i =0; i < cards.length -1; i++) {
      if (cards[i].number < cards[i+1].number) {
        var tmp = cards[i];
        cards[i] = cards[i+1]
        cards[i+1] = tmp;
        cardsSwitched += 1;
      }
    }
  } while (cardsSwitched > 0);
  return cards
}


playComputerCard = function(match) {
  for (var i = 1; i < match.players.length; i++) {
    console.log("Computer Rounds")
    console.log(match)
    if (match.players[i].turn) {
      // Sort computer cards from highest to lowest.
      console.log("TURN TO PLAY CARD")
      var cardsSwitched = 0;
      do {
        cardsSwitched = 0;
        for (var j =0; j < match.players[i].cards.length -1; j++) {
          if (match.players[i].cards[j].number < match.players[i].cards[j+1].number) {
            var tmp = match.players[i].cards[j];
            match.players[i].cards[j] = match.players[i].cards[j+1]
            match.players[i].cards[j+1] = tmp;
            cardsSwitched += 1;
          }
        }
      } while (cardsSwitched > 0);
      // If no cards are played, computer card becomes Lead Card.  Highest card played.
        if (match.fieldCards.length == 0) {
          // find highest card and play it.
          match.fieldCards.push({card: match.players[i].cards[0], owner: match.players[i].userId, leadCard: true})
          match.players[i].cards.splice(0,1)
          match.cardsPlayed += 1;
          match = changeTurn(match)
          return match
        }
        else {
          // If not the lead card, find highest card which matches the lead card suit and play it.
          var leadCard = getLeadCard(match)
          for (var j =0; j < match.players[i].cards.length; j++) {
            if (match.players[i].cards[j].suit == leadCard.card.suit) {
              match.fieldCards.push({card: match.players[i].cards[j], owner: match.players[i].userId, leadCard: false})
              match.players[i].cards.splice(j,1)
              match = changeTurn(match)
              match.cardsPlayed += 1;
              return match
            }
          }
          // If no matching suit is found then play highest card.
          match.fieldCards.push({card: match.players[i].cards[0], owner: match.players[i].userId, leadCard: false})
          match.players[i].cards.splice(0,1)
          match.cardsPlayed += 1;
          match = changeTurn(match)
          return match
        }
      }
      else {
      }
    }
    return match
  }



startMatch = function(match) {
  var index = getPlayerIndex(match,Meteor.user()._id);

  // CONTROL-FLOW #1: DEAL ONE CARD
  if (match.players[index].cards.length == 0 && match.fieldCards.length == 0) {
    var card = getCard(match)
    match.players[index].cards.push(card.card);
    match.cards.splice(card.index,1);
    match.usedCards.push(card.card)
    if (match.type == 'computer') {
      for (var i=1; i < match.players.length; i++) {
        match.players[i].cards.push(card.card);
        match.cards.splice(card.index,1);
        match.usedCards.push(card.card)
      }
    }
  }
  //

  // CONTROL-FLOW #1: PLAY CARD
  //if (userTurn) {
    if (match.usedCards.length == match.players.length) {
    match.fieldCards.push({card: match.players[index].cards[0], owner: Meteor.user()._id})
    match.players[index].cards.splice(0,1)
    if (match.type == 'computer') {
      for (var i=1; i < match.players.length; i++) {
        match.fieldCards.push({card: match.players[i].cards[0], owner: match.players[i].userId })
        match.players[i].cards.splice(0,1)
      }

    }
    //match = changeTurn(match)
    //userTurn = match.players[index].turn
    }
  //}
  //

  // CONTROL;FLOW #1: FIND HIGHEST CARD
  if (match.fieldCards.length == match.players.length) {
    console.log("TEST ")
    match.fieldCards = cardSort(match.fieldCards)
    var dealer = match.fieldCards[0].owner
    var dealerIndex = getPlayerIndex(match,dealer)
    match.players[dealerIndex].dealer = true;
    match.fieldCards = [];
    match.cards = deckReset(match);
    match.usedCards = [];
    match.dealer = true;
    match = changeTurnLeftOfDealer(match);
  }

  return match
}


updateMatch = function(match) {
  /* Document -> NaN
     Update Match
  */
  Matches.update(match._id,{
    $set :{
          players: match.players,
          cards: match.cards,
          usedCards: match.usedCards,
          fieldCards: match.fieldCards,
          round:  match.round,
          trump: match.trump,
          cardsPlayed: match.cardsPlayed,
          cardsDealt: match.cardsDealt,
          dealer: match.dealer
          }
        });
}



updateBids = function(match,bid) {
  /* (Document, Number) -> NaN ; Signature
     Update current User's bid property of the Document.
  */
  var players = match.players;
  for (var i =0; i < players.length; i++) {
    if (players[i].userId == Meteor.user()._id) {
      players[i].currentBid = bid;

      // A turn change is made here.  Does this make sense to include within the function?

      players[i].turn = false;
      if (i == players.length -1) {
        players[0].turn = true
      }
      else {
        players[i+1].turn = true
      }
    }
  }
  Matches.update(match._id, {
    $set : {players: players}
  });
}

updateTrick = function(match) {
  /* Document -> Document; Signature
   Find owner of winning card and update Document.Player.currentTrick
  */

  //VARIABLES
  var winner = findWinner(match,cardSort(match.fieldCards),match.trump);
  var index = getPlayerIndex(match,winner);
  match.players[index].currentTrick += 1;
  match.players[index].turn = true;
  for (var i =0; i < match.players.length; i++) {
    if (i != index) {
      match.players[i].turn = false;
    }
  }
  match.cardsPlayed = 0;
  match.fieldCards = [];
  match.round += 1;
  return match
  //
}


updateScore = function(match) {
  /* Document -> Document
     Subtract currentTrick from Score for each player
  */
  for (var i=0; i < match.players.length; i++) {
    if (match.players[i].highBidder){
      if (match.players[i].currentBid > match.players[i].currentTrick) {
        match.players[i].score = match.players[i].score + 5;
        match.players[i].currentTrick = 0;
        match.players[i].highBidder = false;
      }
      else {
        match.players[i].score = match.players[i].score - match.players[i].currentTrick
        match.players[i].currentTrick = 0;
        match.players[i].highBidder = false;
      }
    }
    else {
      if (match.players[i].currentTrick == 0) {
        match.players[i].score = match.players[i].score + 5
        match.players[i].currentTrick = 0;
      }
      else {
        match.players[i].score = match.players[i].score - match.players[i].currentTrick
        match.players[i].currentTrick = 0;
      }
    }
  }

  for (var i=0; i < match.players.length; i++) {
    match.players[i].turn = false;
  }
  return match
}

resetBids = function(match) {
  /* Document -> Document
     Reset currentBids to 0 and madeBids to false
 */
 for (var i=0; i< match.players.length; i++) {
   match.players[i].currentBid = 0;
   match.players[i].bidMade = false;
 }
 return match
}

deckReset = function(match) {
  /* Document -> NaN
     Push usedCards back onto the Cards array
  */
  var usedCards = match.usedCards;
  var cards = match.cards;
  for (var i=0; i < usedCards.length; i++) {
    cards.push(usedCards[i])
  }
  return cards
}

changeTurnLeftOfDealer = function(match) {
  /* Document -> Document
     Change turn to player left of the dealer
  */
  for (var i =0; i < match.players.length; i++) {
    if (match.players[i].dealer){
      if (i == (match.players.length -1)) {
        match.players[0].turn = true
        break
      }
      else {
        match.players[i+1].turn = true
        break
      }
    }
  }
  return match
}

changeTurn = function(match) {
  /* Document -> Document
     Change turn to player to the left of current turn
  */
  for (var i =0; i < match.players.length; i++) {
    if (match.players[i].turn){
      if (i == (match.players.length -1)) {
        match.players[0].turn = true
        match.players[i].turn =false;
        break
      }
      else {
        match.players[i].turn = false
        match.players[i+1].turn = true
        break
      }
    }
  }
  return match

}


changeDealer = function(match) {
  /* Document -> Document
    Change dealer to the player on the left
  */
  for (var i=0; i < match.players.length; i++) {
    if (match.players[i].dealer) {
      if (i == (match.players.length - 1)){
        match.players[0].dealer = true;
        match.players[i].dealer = false;
        break
      }
      else {
        match.players[i+1].dealer = true;
        match.players[i].dealer = false
        break
      }
    }
  }
  return match
}


/////////////////////////
/* MATCH FUNCTIONS */
/////////////////////////


bidsComplete = function(match) {
  var check = 0;
  for (var i=0; i < match.players.length; i++) {
    if (match.players[i].bidMade) {
      check +=1;
    }
  }

  if (check == match.players.length){
    return true;
  }
  else {
    return false
  }
}


findWinner = function(match,cards,trumpCard) {
  /* (Array,String) -> String
     Return playerID of winning card.
  */
  console.log(cards[0])
  console.log(cards[1])
  for (var i=0; i < cards.length; i++) {
    if (cards[i].card.suit == trumpCard) {
      return cards[i].owner;
    }
  }
  var leadCard = getLeadCard(match);
  for (var i=0; i < cards.length; i++) {
    if (cards[i].card.suit == leadCard.card.suit) {
      return cards[i].owner
    }
  }
}


cardSort = function(fieldCards) {
  /* Array -> Array
     Return sorted array from highest card to lowest (POSSIBLE USE OF MONGO SORT?)
  */
  console.log('sorting cards...')
  console.log(fieldCards[0])
  console.log(fieldCards[1])
  var cardsSwitched = 0;
  do {
    cardsSwitched = 0;
    for (var i =0; i < fieldCards.length -1; i++) {
      if (fieldCards[i].card.number < fieldCards[i+1].card.number) {
        console.log(fieldCards[i].card.number + " " + fieldCards[i+1].card.number)
        var tmp = fieldCards[i];
        fieldCards[i] = fieldCards[i+1]
        fieldCards[i+1] = tmp;
        cardsSwitched += 1;
        console.log('cards switched')
      }
    }
  } while (cardsSwitched > 0);
  return fieldCards;
}


checkIfTurn = function(match) {
  /* Document -> Boolean
    Return the current user's turn property of the Match object
  */
  for (var i =0; i < match.players.length; i++) {
    if (match.players[i].userId == Meteor.user()._id) {
      return match.players[i].turn
    }
  }
}


getCard = function(match) {
  /* String -> Document; Signature
     Return a random card from Document.cards
  */
  var randomIndex = Math.floor( Math.random() * (52 - match.usedCards.length) );
  return {card: match.cards[randomIndex], index:randomIndex};
}

getLeadCard = function(match) {
  /* Document -> Card
    Return lead card from fieldCards
  */
  for (var i =0; i < match.fieldCards.length; i++) {
    if (match.fieldCards[i].leadCard){
      return match.fieldCards[i]
    }
  }
}


dealCards = function(match) {
  /* Document -> Document ; Signature
     Push 5 Cards objects onto the Document.players array.
  */
  for (var j=0; j < 5; j++) {
    for (var i=0; i < match.players.length; i++) {
      var card = getCard(match)
      console.log(card.card)
      match.players[i].cards.push(card.card);
      match.cards.splice(card.index,1);
      match.usedCards.push(card.card);
      if (match.cards.length == 0) {
        match.cards = deckReset(match);
        match.usedCards = [];
      }
    }
  }
  match.cardsDealt = true;
  return match
}



getPlayerIndex = function(match,userId) {
  /* Document -> Number
     Return the index to the players array for the current user
  */
  for (var i = 0; i < match.players.length; i++) {
    if (match.players[i].userId == userId) {
      return i;
    }
  }
}

setTrump = function(match) {
  /* Document -> Document
    Find the highest bidder, and give them the trump
  */
  var highBid = {};
  for (var i = 0; i < match.players.length; i++) {
    if (match.players[i].turn) {
      highBid = match.players[i]
      break
    }
  }

  for (var i = 0; i < match.players.length; i++) {
    if (match.players[i].currentBid > highBid.currentBid) {
      highBid = match.players[i]
    }
  }
  var index = match.players.indexOf(highBid)
  match.players[index].pickTrump = true
  match.players[index].highBidder = true

  for (var i=0; i < match.players.length; i++) {
    if (match.players[i].highBidder) {
      match.players[i].turn = true
    }
    else {
      match.players[i].turn = false
      match.players[i].currentBid = 1;
    }
  }
  return match
}
