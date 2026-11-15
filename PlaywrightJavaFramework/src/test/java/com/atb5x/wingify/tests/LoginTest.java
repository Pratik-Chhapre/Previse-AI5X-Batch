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

@Epic("Wingify")
@Feature("Login")
public class LoginTest extends BaseTest {

    @Test(description = "Login page shows the email, password, sign-in, and Remember me controls")
    @Story("Login page UI")
    @Severity(SeverityLevel.CRITICAL)
    public void loginFormDisplaysRequiredControls() {
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "Email, password, and Sign in controls should be visible.");
        Assert.assertTrue(loginPage.isRememberMeLabelVisible(),
                "Remember me control should be visible.");
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

    @Test(description = "Submitting empty login fields keeps the login form available")
    @Story("Required fields")
    @Severity(SeverityLevel.NORMAL)
    public void emptyCredentialsDoNotLeaveLoginForm() {
        loginPage.enterEmail("").enterPassword("").clickSignIn();
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "The login form should remain visible after submitting empty fields.");
        Assert.assertTrue(loginPage.currentUrl().contains("#/login"),
                "Submitting empty fields should keep the user on the login route.");
    }

    @Test(description = "Authorized valid credentials reach a configured success indicator")
    @Story("Valid login")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Requires WINGIFY_USERNAME, WINGIFY_PASSWORD, and WINGIFY_SUCCESS_XPATH. Use an authorized test account and a verified post-login XPath.")
    public void validCredentialsReachConfiguredSuccessIndicator() {
        String username = environmentValue("WINGIFY_USERNAME");
        String password = environmentValue("WINGIFY_PASSWORD");
        String successXPath = environmentValue("WINGIFY_SUCCESS_XPATH");
        if (username == null || password == null || successXPath == null) {
            throw new SkipException("Insufficient information to determine. Configure authorized credentials and a verified success XPath.");
        }
        loginPage.enterEmail(username).enterPassword(password).clickSignIn();
        loginPage.waitForVisibleXPath(successXPath);
    }

    @Test(description = "Configured invalid credentials are rejected while the login form remains available")
    @Story("Invalid login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Requires WINGIFY_INVALID_USERNAME and WINGIFY_INVALID_PASSWORD from an authorized test setup. Inference (low confidence): rejected credentials leave the login form visible.")
    public void invalidCredentialsKeepLoginFormVisible() {
        String username = environmentValue("WINGIFY_INVALID_USERNAME");
        String password = environmentValue("WINGIFY_INVALID_PASSWORD");
        if (username == null || password == null) {
            throw new SkipException("Insufficient information to determine. Configure authorized invalid-credential test data.");
        }
        loginPage.enterEmail(username).enterPassword(password).clickSignIn();
        Assert.assertTrue(loginPage.isLoginFormVisible(),
                "Inference (low confidence): rejected credentials leave the login form visible.");
    }
}
