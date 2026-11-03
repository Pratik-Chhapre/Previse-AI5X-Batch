package com.atb5x.wingify.base;

import com.atb5x.wingify.exceptions.FrameworkException;
import com.atb5x.wingify.pages.LoginPage;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.PlaywrightException;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public abstract class BaseTest {

    private final Properties config = new Properties();
    private Playwright playwright;
    private Browser browser;
    private BrowserContext context;
    private Page page;

    protected LoginPage loginPage;

    @BeforeClass(alwaysRun = true)
    public void startBrowser() {
        loadConfiguration();
        boolean headless = Boolean.parseBoolean(setting("headless", "PLAYWRIGHT_HEADLESS"));
        String browserChannel = setting("browser.channel", "PLAYWRIGHT_BROWSER_CHANNEL");
        try {
            playwright = Playwright.create();
            browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions()
                            .setChannel(browserChannel)
                            .setHeadless(headless));
            System.out.printf("Starting Chrome channel '%s' in %s mode.%n",
                    browserChannel, headless ? "headless" : "headed");
        } catch (PlaywrightException e) {
            closeBrowserResources();
            throw new FrameworkException("Unable to start the configured Playwright browser.", e);
        }
    }

    @BeforeMethod(alwaysRun = true)
    public void openLoginPage() {
        try {
            context = browser.newContext();
            page = context.newPage();
            page.setDefaultTimeout(Long.parseLong(setting("timeout.milliseconds", "PLAYWRIGHT_TIMEOUT_MILLISECONDS")));
            loginPage = new LoginPage(page).open(setting("base.url", "WINGIFY_BASE_URL"));
        } catch (PlaywrightException | NumberFormatException e) {
            throw new FrameworkException("Unable to initialize the Wingify login test.", e);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void closeTestContext() {
        if (context == null) {
            return;
        }
        try {
            context.close();
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to close the Playwright browser context.", e);
        } finally {
            context = null;
            page = null;
            loginPage = null;
        }
    }

    @AfterClass(alwaysRun = true)
    public void closeBrowser() {
        closeBrowserResources();
    }

    protected String environmentValue(String name) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void loadConfiguration() {
        try (InputStream input = BaseTest.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input == null) {
                throw new FrameworkException("config.properties was not found on the test classpath.");
            }
            config.load(input);
        } catch (IOException e) {
            throw new FrameworkException("Unable to load config.properties.", e);
        }
    }

    private String setting(String propertyName, String environmentName) {
        String value = System.getProperty(propertyName);
        if (value == null || value.isBlank()) {
            value = System.getenv(environmentName);
        }
        if (value == null || value.isBlank()) {
            value = config.getProperty(propertyName);
        }
        if (value == null || value.isBlank()) {
            throw new FrameworkException("Missing configuration value: " + propertyName);
        }
        return value.trim();
    }

    private void closeBrowserResources() {
        try {
            if (context != null) {
                context.close();
                context = null;
            }
            if (browser != null) {
                browser.close();
                browser = null;
            }
        } catch (PlaywrightException e) {
            throw new FrameworkException("Unable to close Playwright browser resources.", e);
        } finally {
            if (playwright != null) {
                playwright.close();
                playwright = null;
            }
        }
    }
}
