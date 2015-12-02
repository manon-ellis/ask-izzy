/* @flow */

import React from "react";
import { History } from "react-router";
import reactMixin from "react-mixin";

import components from "../components";
import icons from "../icons";

/*::`*/@reactMixin.decorate(History)/*::`;*/
class AppBar extends React.Component {
    static propTypes = {
        title: React.PropTypes.string.isRequired,
        onBackTouchTap: React.PropTypes.func.isRequired,
    };

    static sampleProps = {default: {
        title: "App bar",
        onBackTouchTap: function() {},
    }};

    render(): ReactElement {
        return (
            <div className="AppBar">
                {this.renderBackButton()}
                <h1 className="title">{this.props.title}</h1>
                <div className="button-container force-centering" />
            </div>
        );
    }

    renderBackButton(): ?ReactElement {
        return (
            <components.IconButton
                className="BackButton button-container"
                onClick={this.props.onBackTouchTap}
            >
                <icons.ChevronBack />
                <span className="back-label">
                    {this.props.backMessage}
                </span>
            </components.IconButton>
        )
    }

}

export default AppBar;
