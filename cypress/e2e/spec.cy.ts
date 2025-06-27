/// <reference types="cypress" />

//path where the custom command delcare 
/// <reference path = "../../cypress/support/casinoURLCommands.d.ts"/>
/// <reference path = "../../cypress/support/casinoSingUpCommands.d.ts"/>
/// <reference path = "../../cypress/support/casinoLogINOUTCommands.d.ts"/>

// importing the variavle with the url properties 
import { enviroments } from '../../cypress/support/dataFile'


//create  variable , loop for these brands 
const brands = [
  { name: 'MadCasino', url: enviroments.madcasino },
  { name: 'Slottio', url: enviroments.slottio }
];
//loop before test
brands.forEach((brand) => {

  describe(`Test in Online Casino - ${brand.name}`, () => {
    //use befoe Each test to clear cashe and cookies with the below functions from cypress library
    beforeEach(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
    })

    it('Validation State for Sign-Up Fields(Empty Fields)', () => {
      cy.visitCasino(brand.url)
      cy.signUpForm('areEmptyData')
        cy.readFile('cypress/fixtures/emtpyFieldsMessageAllEmpty.json').then((data) => {
          const emptyFieldsMessage = data.message;
          cy.writeFile('cypress/fixtures/validationResults.json', data, { flag: 'a+' }).then(() => {
            cy.log(`Validation result for ${brand.name} - Empty Fields: ${emptyFieldsMessage}`);
          });
        });
      })
    })

    it('Validation State for Sign-Up Fields(Invalid Fields in Step 1)', () => {
      cy.visitCasino(brand.url)
      cy.signUpForm('isInvalidPasswordAndEmail')
    })

    it('Validation State for Sign-Up Fields(Invalid Fields in Step 2)', () => {
      cy.visitCasino(brand.url)
      cy.signUpForm('isInvalidFirstNameLastName')
    })

    it('Validation State for Sign-Up Fields(Fill ALL Fields + Verify User After Registration)', () => {
      cy.visitCasino(brand.url)
      cy.signUpForm('areAllFilled')
      cy.validationOfCustomer()
    })

    it('Log In To Account - Log Out - Ensure users are redirected to the login page or homepage )', () => {
      cy.visitCasino(brand.url)
      cy.logIn('areCorrectCredentials')
      cy.logOut()
    })

    it('Log In To Account - Invalid Password - Validation Alert message)', () => {
      cy.visitCasino(brand.url)
      cy.logIn('areInvalidCredentials')
    })
  })

})