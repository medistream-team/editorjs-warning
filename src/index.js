/**
 * Import Tool's icon
 */
const IconWarning = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.5 12C20.5 7.30558 16.6944 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12.75 7V14.2727H11.25V7H12.75ZM12.75 15.6364V17H11.25V15.6364H12.75Z" fill="black"/></svg>'
/**
 * Build styles
 */
require("./index.css").toString();

/**
 * @class Warning
 * @classdesc Warning Tool for Editor.js
 * @property {WarningData} data - Warning Tool`s input and output data
 * @property {object} api - Editor.js API instance
 *
 * @typedef {object} WarningData
 * @description Warning Tool`s input and output data
 * @property {string} title - warning`s title
 * @property {string} message - warning`s message
 *
 * @typedef {object} WarningConfig
 * @description Warning Tool`s initial configuration
 * @property {string} titlePlaceholder - placeholder to show in warning`s title input
 * @property {string} messagePlaceholder - placeholder to show in warning`s message input
 */
export default class Warning {
  /**
   * Notify core that read-only mode is supported
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Get Toolbox settings
   *
   * @public
   * @returns {string}
   */
  static get toolbox() {
    return {
      icon: IconWarning,
      title: "Warning",
    };
  }

  /**
   * Allow to press Enter inside the Warning
   *
   * @public
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Default placeholder for warning message
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_MESSAGE_PLACEHOLDER() {
    return "Message";
  }

  /**
   * Warning Tool`s styles
   *
   * @returns {object}
   */
  get CSS() {
    return {
      baseClass: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: "cdx-warning",
      wrapperForType: (type) => `cdx-warning-${type}`,
      message: "cdx-warning__message",
      settingsContainer: "settingsButton-wrapper",
      title: "title",
      background: "bg",
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {WarningData} data — previously saved data
   * @param {WarningConfig} config — user config for Tool
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.messagePlaceholder =
      config.messagePlaceholder || Warning.DEFAULT_MESSAGE_PLACEHOLDER;
    this.defaultType = config.defaultType;

    this.readOnly = readOnly;
    this.config = {
      defaultType: config.defaultType,
      typeColor: config.typeColor,
    };
    this.data = {
      type: Object.keys(this.config.typeColor).includes(data.type)
        ? data.type
        : this.defaultType,
      message: data.message || "",
    };
  }

  /**
   * Create Warning Tool container with inputs
   *
   * @returns {Element}
   */
  render() {
    const containerClasses = [
      this.CSS.wrapper,
      this.CSS.wrapperForType(this.data.type),
    ];

    const messageEl = this._make("div", [this.CSS.message], {
      contentEditable: !this.readOnly,
      innerHTML: this.data.message,
    });

    this.background = this._make("div", [this.CSS.background]);

    messageEl.dataset.placeholder = this.messagePlaceholder;

    this.container = this._make("div", containerClasses);

    this.container.appendChild(this.background);
    this.container.appendChild(messageEl);

    if (this.data.type) {
      const calloutType = this.data.type;
      const colorCode = this.config.typeColor[`${calloutType}`];
      this.background.style.backgroundColor = colorCode;
    }

    return this.container;
  }

  /**
   * Create Block's settings block
   *
   * @returns {HTMLElement}
   */

  renderSettings() {
    const settingsContainer = this._make("div", [this.CSS.settingsContainer]);
    const title = this._make("div", [this.CSS.title]);
    title.innerHTML = `${this.api.i18n.t(" Type")} `;
    settingsContainer.appendChild(title);

    Object.keys(this.config.typeColor).forEach((type) => {
      const settingsButton = this._make(
        "div",
        [
          this.CSS.settingsButton,
          this.CSS.wrapper,
          this.CSS.wrapperForType(type),
        ],
        {
          innerHTML: "A",
        }
      );
      if (this.data.type === type) {
        // Highlight current type button
        settingsButton.classList.add(this.CSS.settingsButtonActive);
      }

      settingsButton.addEventListener("click", () => {
        this._changeAlertType(type);

        // Un-highlight previous type button
        settingsContainer
          .querySelectorAll(`.${this.CSS.settingsButton}`)
          .forEach((button) =>
            button.classList.remove(this.CSS.settingsButtonActive)
          );

        // and highlight the clicked type button
        settingsButton.classList.add(this.CSS.settingsButtonActive);
      });

      settingsContainer.appendChild(settingsButton);
    });

    return settingsContainer;
  }

  /**
   * Helper for changing style of Alert block with the selected Alert type
   *
   * @param {string} newType - new Alert type to be applied to the block
   * @private
   */
  _changeAlertType(newType) {
    // Save new type
    this.data.type = newType;

    Object.keys(this.config.typeColor).forEach((type) => {
      const warningClass = this.CSS.wrapperForType(type);
      // Remove the old Alert type class
      this.container.classList.remove(warningClass);

      if (newType === type) {
        // Add an Alert class for the selected Alert type
        this.container.classList.add(warningClass);

        const colorCode = this.config.typeColor[`${type}`];
        this.background.style.backgroundColor = colorCode;
      }
    });
  }

  /**
   * Extract Warning data from Warning Tool element
   *
   * @param {HTMLDivElement} warningElement - element to save
   * @returns {WarningData}
   */
  save(warningElement) {
    const messageEl = warningElement.querySelector(`.${this.CSS.message}`);

    return { ...this.data, message: messageEl.innerHTML };
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {Array|string} classNames  - list or name of CSS classname(s)
   * @param  {object} attributes        - any attributes
   * @returns {Element}
   */
  _make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Sanitizer config for Warning Tool saved data
   *
   * @returns {object}
   */
  static get sanitize() {
    return {
      type: {},
      message: {
        br: true,
        div: true
      },
    };
  }
}
