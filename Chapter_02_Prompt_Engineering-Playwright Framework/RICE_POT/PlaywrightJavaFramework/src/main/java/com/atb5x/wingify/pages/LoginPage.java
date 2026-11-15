package com.atb5x.wingify.pages;

import com.atb5x.wingify.exceptions.FrameworkException;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.BoundingBox;
import com.microsoft.playwright.options.ViewportSize;

import java.util.Objects;

public class LoginPage {

    private final Page page;
    private final Locator emailInput;
    private final Locator passwordInput;
    private final Locator emailLabel;
    private final Locator passwordLabel;
    private final Locator emailValidationFeedback;
    private final Locator rememberMeCheckbox;
    private final Locator rememberMeLabel;
    private final Locator signInButton;
    private final Locator forgotPasswordButton;
    private final Locator passwordVisibilityButton;
    private final Locator googleSignInButton;
    private final Locator ssoSignInButton;
    private final Locator passkeySignInButton;
    private final Locator freeTrialLink;

    public LoginPage(Page page) {
        this.page = Objects.requireNonNull(page, "page must not be null");
        this.emailInput = page.locator("xpath=//*[@id='login-username']");
        this.passwordInput = page.locator("xpath=//*[@id='login-password']");
        this.emailLabel = page.locator("xpath=//label[@for='login-username']");
        this.passwordLabel = page.locator("xpath=//label[@for='login-password']");
        this.emailValidationFeedback = page.locator(
                "xpath=//*[@id='login-username']/following-sibling::*[contains(@class,'invalid-reason')]");
        this.rememberMeCheckbox = page.locator("xpath=//*[@id='checkbox-remember']");
        this.rememberMeLabel = page.locator("xpath=//label[@for='checkbox-remember']");
        this.signInButton = page.locator("xpath=//*[@id='js-login-btn']");
        this.forgotPasswordButton = page.locator("xpath=//button[normalize-space(.)='Forgot Password?']");
        this.passwordVisibilityButton = page.locator(
                "xpath=//*[@id='login-password']/following-sibling::button[@aria-label='Toggle password visibility']");
        this.googleSignInButton = page.locator("xpath=//*[@id='js-google-signin-btn']");
        this.ssoSignInButton = page.locator("xpath=//button[normalize-space(.)='Sign in using SSO']");
        this.passkeySignInButton = page.locator("xpath=//button[normalize-space(.)='Sign in with Passkey']");
        this.freeTrialLink = page.locator("xpath=//a[contains(@href,'free-trial')]");
    }

    public LoginPage open(String url) {
        try {
            page.navigate(url);
            emailInput.waitFor();
            passwordInput.waitFor();
            signInButton.waitFor();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to open the VWO login page.", e);
        }
    }

    public boolean isLoginFormVisible() {
        try {
            return emailInput.isVisible() && passwordInput.isVisible() && signInButton.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the VWO login form.", e);
        }
    }

    public boolean isRememberMeLabelVisible() {
        try {
            return rememberMeLabel.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the Remember me control.", e);
        }
    }

    public boolean isEmailLabelAssociated() {
        try {
            return Boolean.TRUE.equals(emailInput.evaluate(
                    "element => Array.from(element.labels || []).some(label => label.textContent.trim() === 'Email address')"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the email field label.", e);
        }
    }

    public boolean isPasswordLabelAssociated() {
        try {
            return Boolean.TRUE.equals(passwordInput.evaluate(
                    "element => Array.from(element.labels || []).some(label => label.textContent.trim() === 'Password')"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the password field label.", e);
        }
    }

    public boolean isEmailFocused() {
        try {
            return Boolean.TRUE.equals(emailInput.evaluate("element => element === document.activeElement"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify keyboard focus on the email field.", e);
        }
    }

    public LoginPage focusFieldsUsingLabels() {
        try {
            emailLabel.click();
            passwordLabel.click();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to focus login fields through their labels.", e);
        }
    }

    public boolean areEmailAndPasswordRequired() {
        try {
            return Boolean.TRUE.equals(emailInput.evaluate("element => element.required"))
                    && Boolean.TRUE.equals(passwordInput.evaluate("element => element.required"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify required login fields.", e);
        }
    }

    public boolean isEmailValidationFeedbackVisible() {
        try {
            return emailValidationFeedback.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify email validation feedback.", e);
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

    public boolean isPasswordMasked() {
        try {
            return "password".equals(passwordInput.getAttribute("type"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to read the password field visibility.", e);
        }
    }

    public LoginPage togglePasswordVisibility() {
        try {
            passwordVisibilityButton.click();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to toggle password visibility.", e);
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

    public boolean isEmailFormatInvalid() {
        try {
            return Boolean.TRUE.equals(emailInput.evaluate("element => element.validity.typeMismatch"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify email format validation.", e);
        }
    }

    public LoginPage focusEmailAndMoveToNextField() {
        try {
            emailInput.click();
            emailInput.press("Tab");
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to navigate between login fields using the keyboard.", e);
        }
    }

    public boolean isPasswordFocused() {
        try {
            return Boolean.TRUE.equals(passwordInput.evaluate("element => element === document.activeElement"));
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify keyboard focus on the password field.", e);
        }
    }

    public boolean isForgotPasswordButtonVisible() {
        try {
            return forgotPasswordButton.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the password recovery control.", e);
        }
    }

    public boolean areAlternativeSignInOptionsVisible() {
        try {
            return googleSignInButton.isVisible() && ssoSignInButton.isVisible() && passkeySignInButton.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify alternative sign-in controls.", e);
        }
    }

    public boolean isFreeTrialLinkVisible() {
        try {
            return freeTrialLink.isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the free-trial registration link.", e);
        }
    }

    public String freeTrialLinkTarget() {
        try {
            return freeTrialLink.getAttribute("href");
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to read the free-trial registration link.", e);
        }
    }

    public LoginPage openForgotPassword() {
        try {
            forgotPasswordButton.click();
            page.locator("xpath=//*[@id='forgot-password-username']").waitFor();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to open password recovery.", e);
        }
    }

    public boolean isForgotPasswordFormVisible() {
        try {
            return page.locator("xpath=//*[@id='forgot-password-username']").isVisible()
                    && page.locator("xpath=//*[@id='forgot-password-username']/following::button[normalize-space(.)='Reset Password'][1]")
                    .isVisible();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify the password recovery form.", e);
        }
    }

    public LoginPage returnToLoginFromForgotPassword() {
        try {
            page.locator("xpath=//*[@id='forgot-password-username']/following::button[normalize-space(.)='Back'][1]")
                    .click();
            emailInput.waitFor();
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to return to the login form from password recovery.", e);
        }
    }

    public LoginPage setViewportSize(int width, int height) {
        try {
            page.setViewportSize(width, height);
            return this;
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to set the browser viewport.", e);
        }
    }

    public boolean areCoreControlsWithinViewport() {
        try {
            ViewportSize viewport = page.viewportSize();
            return viewport != null
                    && fitsViewport(emailInput.boundingBox(), viewport)
                    && fitsViewport(passwordInput.boundingBox(), viewport)
                    && fitsViewport(rememberMeLabel.boundingBox(), viewport)
                    && fitsViewport(signInButton.boundingBox(), viewport);
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to verify responsive login controls.", e);
        }
    }

    public void waitForVisibleXPath(String xpath) {
        if (xpath == null || !xpath.startsWith("/")) {
            throw new FrameworkException("VWO_SUCCESS_XPATH must be an absolute XPath expression.");
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

    public boolean isSecureConnection() {
        return currentUrl().startsWith("https://");
    }

    private boolean fitsViewport(BoundingBox box, ViewportSize viewport) {
        return box != null
                && box.x >= 0
                && box.y >= 0
                && box.x + box.width <= viewport.width
                && box.y + box.height <= viewport.height;
    }
}
