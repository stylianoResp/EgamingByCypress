/// <reference types="cypress" />
// This file contains custom Cypress commands for logging in and logging out users.
// It uses fixture files to retrieve user credentials generated during registration.

import {enviroments} from './dataFile'

// Helper: Click the "Log in" button and ensure the login modal is visible
const logInButton = () => {
    cy.get('.header__right')
        .contains('Log in')
        .should('be.visible')
        .should('be.enabled')
        .click()
    cy.get('.modal-authentication > .modal__dialog > .modal__content').should('be.visible')
}

// Helper: Fill in login credentials
// - If itsInvalidPassword is true, use a hardcoded invalid password
// - Otherwise, use the password from the registration fixture
const logInCredentials = (itsInvalidPassword = false) => {
    cy.get('.flex-grow').should('be.visible').within(() => {
        // Read email from fixture file generated during registration
        cy.readFile('cypress/fixtures/randomEmail.json').then((email) => {
            const credentialsEmail = email.userEmail.toString()
            cy.get('#emailLogin').should('be.empty').type(credentialsEmail)
        })
        // If testing invalid password, use a hardcoded value
        if (itsInvalidPassword) {
            cy.get('#passwordLogin').should('be.empty').type('1234')
        }
        else {
            // Otherwise, use the password from the registration fixture
            cy.readFile('cypress/fixtures/randomPassword.json').then((password) => {
                const credentialsPassword = password.userPassword.toString()
                cy.get('#passwordLogin').should('be.empty').type(credentialsPassword)
            })
        }
        // Intercept login API call for assertion
        cy.intercept('POST', '/livewire/update').as('livewireUpdate');
        // Click the Log In button
        cy.get('button[type="submit"]').contains('Log in').click()
        // Wait for the API response and assert status
        cy.wait('@livewireUpdate', { timeout: 7000 }).then((interception) => {
            expect([200, 302]).to.include(interception.response?.statusCode);
        })
    })
}

// Main logIn command
// Accepts a logInType string to determine which scenario to run
const logIn = (logInType:string): void => {
    switch (logInType) {
        case 'areInvalidCredentials':
            // Attempt login with invalid password
            logInButton()
            logInCredentials(true)
            // Capture and save error message for invalid credentials
            cy.get('.gap-y-2').invoke('text').then((text) => {
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Credentials are wrong:  ${errorMessage}`)
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageWrongPassword.json', { message: errorMessage })
            })
            break;
        case 'areCorrectCredentials':
            // Attempt login with correct credentials
            logInButton()
            logInCredentials()
            break;
    }
}

// logOut command
// Logs out the user and ensures redirection to the correct page
const logOut = () => {
    cy.wait(10000)
    cy.get('.header__user-avatar').should('be.visible').click()
    // Clear cookies to avoid backend JSON parsing issues after logout
    // The backend may return HTML instead of JSON, causing errors
    cy.contains('Log out').click()
    cy.clearCookies().wait(10000)
    // Ensure the URL does not include the deposit page
    cy.url().should('not.eq', '/deposit')
    cy.clearCookies();
    // Ensure the URL is the home page for either brand
    cy.url().should((url) => {
        expect(url.startsWith(enviroments.madcasino) || url.startsWith(enviroments.slottio)).to.be.true;
      });
}

// Register custom Cypress commands
Cypress.Commands.add('logIn', logIn)
Cypress.Commands.add('logOut', logOut)