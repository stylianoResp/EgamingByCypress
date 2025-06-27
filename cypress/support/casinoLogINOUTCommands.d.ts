declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a casino by key.
       * @param logInType - add the case text
       */
      logIn(logInType): Chainable<void>;
      logOut(): Chainable<void>;
    }}