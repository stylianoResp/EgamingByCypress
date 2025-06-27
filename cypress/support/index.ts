// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="jquery" />
Cypress.on('uncaught:exception', (err: Error) => {
    const ignoredErrors: string[] = [
      "Unexpected token '<'",
      "Snapshot missing on Livewire component",
      "Uncaught Component already registered",
      "ReferenceError: method is not defined"
      // Add more messages you want to ignore here
    ];
  
    if (ignoredErrors.some(msg => err.message.includes(msg))) {
      return false; // Prevent test failure for these errors
    }
  
    return true; // Let other errors fail the test as usual
  });
// Import commands.js using ES2015 syntax:
import './casinoURLCommands'
import './casinoSingUpCommands'
import './casinoLogINOUTCommands'