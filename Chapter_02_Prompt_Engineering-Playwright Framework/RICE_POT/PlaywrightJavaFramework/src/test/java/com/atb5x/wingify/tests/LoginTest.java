package com.atb5x.wingify.tests;

import com.atb5x.wingify.base.BaseTest;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.Test;

@Epic("VWO")
@Feature("Login")
public class LoginTest extends BaseTest {

    @Test(description = "Login page displays labeled email, password, sign-in, and Remember me controls")
    @Story("Login page UI")
    @Severity(SeverityLevel.CRITICAL)
    public void loginFormDisplaysLabeledControls() {
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "Email, password, and Sign in controls should be visible.");
        Assert.assertTrue(loginPage.isRememberMeLabelVisible(),
                "Remember me control should be visible.");
        Assert.assertTrue(loginPage.isEmailLabelAssociated(),
                "Email address should have an associated label.");
        Assert.assertTrue(loginPage.isPasswordLabelAssociated(),
                "Password should have an associated label.");
        Assert.assertTrue(loginPage.isSecureConnection(),
                "The login page should be served over HTTPS.");
    }

    @Test(description = "Email field receives automatic focus on page load")
    @Story("Login page UX")
    @Severity(SeverityLevel.NORMAL)
    public void emailFieldReceivesInitialFocus() {
        Assert.assertTrue(loginPage.isEmailFocused(),
                "The email field should receive focus when the login page opens.");
    }

    @Test(description = "Clicking field labels focuses their associated inputs")
    @Story("Accessibility")
    @Severity(SeverityLevel.NORMAL)
    public void inputLabelsAreClickable() {
        loginPage.focusFieldsUsingLabels();
        Assert.assertTrue(loginPage.isPasswordFocused(),
                "Clicking the password label should focus the password input.");
    }

    @Test(description = "Remember me can be toggled")
    @Story("Remember me")
    @Severity(SeverityLevel.NORMAL)
    public void rememberMeCanBeToggled() {
        boolean initialState = loginPage.isRememberMeSelected();
        loginPage.toggleRememberMe();
        Assert.assertEquals(loginPage.isRememberMeSelected(), !initialState,
                "Remember me should change state when selected.");
    }

    @Test(description = "Email input applies browser email-format validation")
    @Story("Email validation")
    @Severity(SeverityLevel.NORMAL)
    public void malformedEmailIsIdentifiedAsInvalid() {
        loginPage.enterEmail("not-an-email");
        Assert.assertTrue(loginPage.isEmailFormatInvalid(),
                "Malformed email should fail the email input's browser format validation.");
    }

    @Test(description = "Malformed email displays validation feedback after leaving the field")
    @Story("Email validation")
    @Severity(SeverityLevel.NORMAL)
    public void malformedEmailShowsFeedbackOnBlur() {
        loginPage.enterEmail("not-an-email").enterPassword("");
        Assert.assertTrue(loginPage.isEmailValidationFeedbackVisible(),
                "Malformed email should show actionable feedback after the field loses focus.");
    }

    @Test(description = "Email and password are required before login")
    @Story("Required fields")
    @Severity(SeverityLevel.CRITICAL)
    public void emailAndPasswordAreRequired() {
        Assert.assertTrue(loginPage.areEmailAndPasswordRequired(),
                "Email and password should be marked as mandatory fields.");
    }

    @Test(description = "Password visibility can be toggled without losing the password field")
    @Story("Password management")
    @Severity(SeverityLevel.NORMAL)
    public void passwordVisibilityCanBeToggled() {
        Assert.assertTrue(loginPage.isPasswordMasked(), "Password should be masked by default.");
        loginPage.togglePasswordVisibility();
        Assert.assertFalse(loginPage.isPasswordMasked(), "Password should be visible after toggling visibility.");
        loginPage.togglePasswordVisibility();
        Assert.assertTrue(loginPage.isPasswordMasked(), "Password should be masked again after toggling visibility.");
    }

    @Test(description = "Keyboard navigation moves from email to password")
    @Story("Accessibility")
    @Severity(SeverityLevel.NORMAL)
    public void keyboardCanNavigateLoginFields() {
        loginPage.focusEmailAndMoveToNextField();
        Assert.assertTrue(loginPage.isPasswordFocused(),
                "Keyboard Tab navigation from email should focus the password field.");
    }

    @Test(description = "Password recovery opens and returns to the login form")
    @Story("Password recovery")
    @Severity(SeverityLevel.CRITICAL)
    public void passwordRecoveryFlowCanBeOpenedAndClosed() {
        loginPage.openForgotPassword();
        Assert.assertTrue(loginPage.isForgotPasswordFormVisible(),
                "Password recovery should show an email field and Reset Password action.");
        Assert.assertTrue(loginPage.currentUrl().contains("#/forgot-password"),
                "Password recovery should navigate to its recovery route.");
        loginPage.returnToLoginFromForgotPassword();
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "Back should return to the login form.");
    }

    @Test(description = "Registration and alternative sign-in options are available")
    @Story("Login page options")
    @Severity(SeverityLevel.NORMAL)
    public void registrationAndAlternativeSignInOptionsAreVisible() {
        Assert.assertTrue(loginPage.isFreeTrialLinkVisible(),
                "A free-trial registration link should be available.");
        Assert.assertTrue(loginPage.freeTrialLinkTarget().contains("free-trial"),
                "The registration link should target the free-trial flow.");
        Assert.assertTrue(loginPage.areAlternativeSignInOptionsVisible(),
                "Google, SSO, and passkey sign-in options should be visible.");
    }

    @Test(description = "Core login controls fit a mobile-sized viewport")
    @Story("Responsive login UI")
    @Severity(SeverityLevel.NORMAL)
    public void loginControlsFitMobileViewport() {
        loginPage.setViewportSize(390, 844);
        Assert.assertTrue(loginPage.areCoreControlsWithinViewport(),
                "Email, password, Remember me, and Sign in controls should fit the mobile viewport.");
    }

    @Test(description = "Authorized valid credentials reach a configured VWO success indicator")
    @Story("Valid login")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Requires VWO_USERNAME, VWO_PASSWORD, and VWO_SUCCESS_XPATH. Use an authorized test account and a verified post-login XPath.")
    public void validCredentialsReachConfiguredSuccessIndicator() {
        String username = environmentValue("VWO_USERNAME");
        String password = environmentValue("VWO_PASSWORD");
        String successXPath = environmentValue("VWO_SUCCESS_XPATH");
        if (username == null || password == null || successXPath == null) {
            throw new SkipException("Insufficient information to determine. Configure authorized credentials and a verified success XPath.");
        }
        loginPage.enterEmail(username).enterPassword(password).clickSignIn();
        loginPage.waitForVisibleXPath(successXPath);
    }

    @Test(description = "Configured invalid credentials do not open an authenticated session")
    @Story("Invalid login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Requires VWO_INVALID_USERNAME, VWO_INVALID_PASSWORD, and VWO_INVALID_ERROR_XPATH from an authorized test setup.")
    public void invalidCredentialsKeepLoginFormVisible() {
        String username = environmentValue("VWO_INVALID_USERNAME");
        String password = environmentValue("VWO_INVALID_PASSWORD");
        String errorXPath = environmentValue("VWO_INVALID_ERROR_XPATH");
        if (username == null || password == null || errorXPath == null) {
            throw new SkipException("Insufficient information to determine. Configure authorized invalid-credential test data and a verified error XPath.");
        }
        loginPage.enterEmail(username).enterPassword(password).clickSignIn();
        loginPage.waitForVisibleXPath(errorXPath);
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "Invalid credentials should leave the login form visible.");
    }
}
