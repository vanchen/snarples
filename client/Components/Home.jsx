


// Interface Components

Home = React.createClass({

    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
          user: Meteor.user(),
          matches: Matches.find().fetch()
      }
    },

    handleSelect() {
          Meteor.logout()
    },


    createMatch() {
      var cards = Cards.find().fetch();
      Matches.insert({
        type: 2,
        players: [{userId: Meteor.user()._id , cards: [] , score: 16, turn: false, currentBid: 0,bidMade: false, pickTrump: false, currentTrick: 0, dealer: false,highBidder: false }],
        cards: cards,
        host: Meteor.user()._id,
        usedCards: [],
        fieldCards: [],
        round:  0,
        trump: 'none',
        cardsPlayed: 0,
        cardsDealt: false,
        dealer: false
      });
    },

    joinMatch(e) {
      var matchId = e.currentTarget.id;
      Matches.update(matchId, {
        $push: {players: {userId: Meteor.user()._id, cards: [], score: 16, turn: false,currentBid:0, bidMade: false, pickTrump: false, currentTrick: 0, dealer: false, highBidder:false }}
      });
      var url = '/match/' + matchId;
      FlowRouter.go(url);
    },


    continueMatch(e) {
      FlowRouter.go('/match/' + e.currentTarget.id)

    },

    handleLogin(e) {
          e.preventDefault();
          var emailVar = ReactDOM.findDOMNode(this.refs.email).value;
          var passwordVar = ReactDOM.findDOMNode(this.refs.pwd).value;
          Meteor.loginWithPassword(emailVar, passwordVar);
    },

    handleRegister(e) {
        e.preventDefault();
        var emailVar = ReactDOM.findDOMNode(this.refs.email1).value;
        var passwordVar = ReactDOM.findDOMNode(this.refs.pwd1).value;
        Accounts.createUser({
            email: emailVar,
            password: passwordVar
        });
    },

    findMatches() {
      var matches = this.data.matches;
      return this.data.matches.map((matches) => {
        var newMatch = true;
        for (var i =0; i < matches.players.length; i++) {
          if (matches.players[i].userId == Meteor.user()._id) {
            newMatch = false;
          }
        }
        if (newMatch) {
            return <a href="#" className="list-group-item active" id={matches._id} onClick={this.joinMatch}>
              <h4 className="list-group-item-heading text-capitalize"> {matches.type} </h4>
              <p className="list-group-item-text"> Player 1 vs Player 2</p>
            </a>
          }
      });
  },

  currentMatches() {
    var matches = this.data.matches;
    return this.data.matches.map((matches) => {
      for (var i =0; i < matches.players.length; i++) {
        if (matches.players[i].userId == Meteor.user()._id) {
          return <a href="#" className="list-group-item active" id={matches._id} onClick={this.continueMatch}>
            <h4 className="list-group-item-heading text-capitalize"> {matches.type} </h4>
            <p className="list-group-item-text"> Player 1 vs Player 2</p>
          </a>
        }
      }
    });
  },

  render() {
    if (this.data.user) {
      return(
        <div className="sidebar thumbnail">
        <Tabs className="sidebar-content" defaultActiveKey={1} position="left" tabWidth={2}>
        <Tab eventKey={1} title="Profile">
        </Tab>
        <Tab eventKey={2} title="Create">
          <Button onClick={this.createMatch} bsStyle="primary" bsSize="large" block>Create Game</Button>
        </Tab>
        <Tab eventKey={3} title="Find">
          <div className="list-group">
            {this.findMatches()}
          </div>
        </Tab>
        <Tab eventKey={4} title="Current">
          <div className="list-group">
            {this.currentMatches()}
          </div>
        </Tab>
        <Tab eventKey={5} title="Completed">
        </Tab>
      <Tab eventKey={6} title="Logouts">
        <div className="well">
          <Button onClick={this.handleSelect} bsStyle="primary" bsSize="large" block>Logout</Button>
        </div>

      </Tab>
      </Tabs>
    </div>
      )
    }
    else {
      return(
        <div className="sidebar thumbnail">
        <Tabs className="sidebar-content" defaultActiveKey={1} position="left" tabWidth={3}>
        <Tab eventKey={1} title="Login">
          <form role="form">
            <div className="form-group">
              <label for="email">Email address:</label>
              <input type="email" className="form-control" ref="email"/>
            </div>
            <div className="form-group">
              <label for="pwd">Password:</label>
              <input type="password" className="form-control" ref="pwd"/>
            </div>
            <div className="checkbox">
              <label><input type="checkbox"/ > Remember me</label>
            </div>
            <button type="submit" onClick={this.handleLogin} className="btn btn-default">Login</button>
          </form>
        </Tab>
        <Tab eventKey={2} title="Register">
          <form role="form">
            <div className="form-group">
              <label for="email">Email address:</label>
              <input type="email" className="form-control" ref="email1"/>
            </div>
            <div className="form-group">
              <label for="pwd">Password:</label>
              <input type="password" className="form-control" ref="pwd1"/>
            </div>
            <div className="checkbox">
              <label><input type="checkbox"/ > Remember me</label>
            </div>
            <button type="submit" onClick={this.handleRegister} className="btn btn-default">Register</button>
          </form>
        </Tab>
      </Tabs>
    </div>
      )
    }
  }
});
