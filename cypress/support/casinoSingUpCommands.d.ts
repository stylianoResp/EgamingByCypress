declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit a casino by key.
       * @param dataType - add the case NAME
       */
      signUpForm(dataType:string): Chainable<void>;
      validationOfCustomer():Chainable<void>;
    }}