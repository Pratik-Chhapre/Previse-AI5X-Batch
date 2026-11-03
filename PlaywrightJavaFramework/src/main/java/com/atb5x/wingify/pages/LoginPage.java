package com.atb5x.wingify.pages;

import com.atb5x.wingify.exceptions.FrameworkException;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;

import java.util.Objects;

public class LoginPage {

    private final Page page;
    private final Locator emailInput;
    private final Locator passwordInput;
    private final Locator rememberMeCheckbox;
    private final Locator rememberMeLabel;
    private final Locator signInButton;

    public LoginPage(Page page) {
        this.page = Objects.requireNonNull(page, "page must not be null");
        this.emailInput = page.locator("xpath=//*[@id='login-username']");
        this.passwordInput = page.locator("xpath=//*[@id='login-password']");
        this.rememberMeCheckbox = page.locator("xpath=//*[@id='checkbox-remember']");
        this.rememberMeLabel = page.locator("xpath=//label[normalize-space(.)='Remember me']");
        this.signInButton = page.locator("xpath=//*[@id='js-login-btn']");
    }

    public LoginPage open(String url) {
        try {
            page.navigate(url);
            emailInput.waitFor();
            passwordInput.waitFor();
            signInButton.waitFor();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to open the Wingify login page.", e);
        }
    }

    public boolean isLoginFormVisible() {
        try {
            return emailInput.isVisible() && passwordInput.isVisible() && signInButton.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the Wingify login form.", e);
        }
    }

    public boolean isRememberMeLabelVisible() {
        try {
            return rememberMeLabel.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the Remember me control.", e);
        }
    }

    public boolean isRememberMeSelected() {
        try {
            return rememberMeCheckbox.isChecked();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to read the Remember me selection.", e);
        }
    }

    public LoginPage toggleRememberMe() {
        try {
            rememberMeLabel.click();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to toggle Remember me.", e);
        }
    }

    public LoginPage enterEmail(String email) {
        try {
            emailInput.fill(email);
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to enter the email address.", e);
        }
    }

    public LoginPage enterPassword(String password) {
        try {
            passwordInput.fill(password);
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to enter the password.", e);
        }
    }

    public LoginPage clickSignIn() {
        try {
            signInButton.click();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to submit the login form.", e);
        }
    }

    public void waitForVisibleXPath(String xpath) {
        if (xpath == null || !xpath.startsWith("/")) {
            throw new FrameworkException("WINGIFY_SUCCESS_XPATH must be an absolute XPath expression.");
        }
        try {
            page.locator("xpath=" + xpath).waitFor();
        } catch (PlaywrightException e) {
            throw new FrameworkException("The configured post-login success indicator did not appear.", e);
        }
    }

    public String currentUrl() {
        try {
            return page.url();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to read the current page URL.", e);
        }
    }
}
