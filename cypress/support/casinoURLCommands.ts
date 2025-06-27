/// <reference types="cypress" />
//import { error } from 'cypress/types/jquery';

//set dynamic string for every enviroment , data added in url file 

const visitCasino = (casinoURL: string): void => {
    //casinoURL should not be null or undefined

    if (!casinoURL) {
        throw (`Url is invalid , ${casinoURL}`);
    }
    //visit the env

    else {
        cy.visit(casinoURL)
    }
}


Cypress.Commands.add('visitCasino', visitCasino)