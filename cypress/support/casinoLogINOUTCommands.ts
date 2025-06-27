/// <reference types="cypress" />
import {enviroments} from './dataFile'

// This line enables Cypress auto-completion and types in your editor.

const logInButton = () => {

    cy.get('.header__right')
        .contains('Log in')
        .should('be.visible')
        .should('be.enabled')
        .click()
    cy.get('.modal-authentication > .modal__dialog > .modal__content').should('be.visible')
}

const logInCredentials = (itsInvalidPassword = false) => {
    cy.get('.flex-grow').should('be.visible').within(() => {

        //add the credentials of the user from the invoke jason files during the registration 
        cy.readFile('cypress/fixtures/randomEmail.json').then((email) => {
            //store it in a string variable
            const credentialsEmail = email.userEmail.toString()
            cy.get('#emailLogin').should('be.empty').type(credentialsEmail)
        })
        //codition if itsInvalidPassword = true to provide wrong hardcoded password
        if (itsInvalidPassword) {
            cy.get('#passwordLogin').should('be.empty').type('1234')
        }
        else {
            cy.readFile('cypress/fixtures/randomPassword.json').then((password) => {
                //store it in a string variable
                const credentialsPassword = password.userPassword.toString()
                cy.get('#passwordLogin').should('be.empty').type(credentialsPassword)
            })
        }

        //intercept the api Post which is asserting the succesfull registration 
        cy.intercept('POST', '/livewire/update').as('livewireUpdate');
        //click on Log In Button
        cy.get('button[type="submit"]').contains('Log in').click()
        //wait  for the api 
        cy.wait('@livewireUpdate', { timeout: 7000 }).then((interception) => {
            expect([200, 302]).to.include(interception.response?.statusCode);
        })

    })
}

const logIn = (logInType:string): void => {

    switch (logInType) {
        case 'areInvalidCredentials':
            logInButton()
            logInCredentials(true)
             //capture the error message alert
             cy.get('.gap-y-2').invoke('text').then((text) => {

                //create a string variable to add the text,edit the text with space after any . or !
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Credentials are wrong:  ${errorMessage}`)

                //save the message to a json file  , for later use
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageWrongPassword.json', { message: errorMessage })
             })
            break;

        case 'areCorrectCredentials':
            logInButton()
            logInCredentials()
            break;
    }

}

//logOut Command
const logOut = () => {
    cy.wait(10000)
    cy.get('.header__user-avatar').should('be.visible').click()
    //why adding here cleare cookies - cypress is getting confused once trying to logout - searching for token json 
    //The backend is returning an HTML page
    //This causes the Unexpected token '<' error — which happens when Cypress (or JavaScript code inside the app) tries to parse HTML as JSON.
    //while adding cleare cookies issue get resolved  + manual wait
    cy.contains('Log out').click()
    cy.clearCookies().wait(10000)
    //ensure the url does not include the deposit url 
    cy.url().should('not.eq', '/deposit')
    cy.clearCookies();
    //ensure the url is equal to the home page url
    cy.url().should((url) => {
        expect(url.startsWith(enviroments.madcasino) || url.startsWith(enviroments.slottio)).to.be.true;
      });
      
}

Cypress.Commands.add('logIn', logIn)
Cypress.Commands.add('logOut', logOut)