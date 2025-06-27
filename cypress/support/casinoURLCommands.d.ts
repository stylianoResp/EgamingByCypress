declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit a casino by key.
       * @param casinoURL - The casino identifier like 'madcasino', 'slottio', etc.
       */
      visitCasino(casinoURL: string): Chainable<void>;
    }}