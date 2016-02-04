/////////////////////////
/* UPDATE FUNCTIONS */
/////////////////////////


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
  var winner = findWinner(cardSort(match.fieldCards),match.trump);
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
    match.players[i].score = match.players[i].score - match.players[i].currentTrick
    match.players[i].currentTrick = 0;
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


findWinner = function(cards,trumpCard) {
  /* (Array,String) -> String
     Return playerID of winning card.
  */
  for (var i=0; i < cards.length; i++) {
    if (cards[i].card.suit == trumpCard) {
      return cards[i].owner;
    }
  }
  return cards[0].owner
}


cardSort = function(fieldCards) {
  /* Array -> Array
     Return sorted array from highest card to lowest (POSSIBLE USE OF MONGO SORT?)
  */
  var cardsSwitched = 0;
  do {
    cardsSwitched = 0;
    for (var i =0; i < fieldCards.length -1; i++) {
      if (fieldCards[i].card.number < fieldCards[i+1].card.number) {
        var tmp = fieldCards[i];
        fieldCards[i] = fieldCards[i+1]
        fieldCards[i+1] = tmp;
        cardsSwitched += 1;
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
      match.usedCards.push(card.card)
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
  /* Document -> Number
    Return index of player who has made the highest bid or who bid first
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
    }
  }
  return match
}
