/* @flow */

import React from "react";
import {Link} from "react-router";

import LogoWithShadow from "../LogoWithShadow";
import HeaderBar from "../HeaderBar";
import type {Category} from "../../constants/categories";

import Gender from "../../pages/personalisation/Gender";
import Age from "../../pages/personalisation/Age";
import Location from "../../pages/personalisation/Location";
import storage from "../../storage";
import sendEvent from "../../google-tag-manager";

const HomeLink = () =>
    <Link
        className="homeLink"
        to="/"
        onClick={storage.clear}
    >Go back</Link>;

const ErrorMessage = ({children}: Object) =>
    <p className="errorMessage">{children}</p>;

const InfoMessage = (category: ?Object) =>
    category && <div>{category.info}</div>;

const LogoHeader = ({children}: Object) =>
    <div className="LogoHeader">
        <LogoWithShadow />
        {children}
    </div>;

const trailingSlash = (path: string): string =>
    `${path}${path.endsWith("/") ? "" : "/"}`;

const PersonalisationLink = ({pathname}: Object) =>
    <Link
        className="change-personalisation"
        to={`${trailingSlash(pathname)}personalise/summary`}
        onClick={sendEvent.bind(null, {event: "changeAnswers"})}
    >
        Change your answers
    </Link>;

class LoadingResultsHeader extends React.Component {
    props: {
        personalisationComponents: Array<Object>,
        error: string,
        statusCode: number,
        loading: boolean,
        category?: Category,
        location: {pathname: string},
        title: string,
        meta: {total_count: number},
    };
    state: void;

    render() {
        const {
            error,
            statusCode,
            loading,
            category,
            location,
            title,
            meta,
        } = this.props;

        if (loading) {
            return (
                <HeaderBar
                    className="LoadingResultsHeader"
                    primaryText="Searching..."
                    secondaryText={
                        <div>
                            <LogoWithShadow />
                            Loading results...
                        </div>
                    }
                />
            );
        }

        if (error) {
            const primaryText = (
                <LogoHeader>
                    Sorry, I couldn't do this search.
                </LogoHeader>
            )

            if (statusCode == 402) {
                return (
                    <HeaderBar
                        className="LoadingResultsHeader"
                        primaryText={primaryText}
                        secondaryText={
                            <div>
                                <ErrorMessage>{error}</ErrorMessage>
                                <HomeLink />
                                {' '}
                                <PersonalisationLink {...location} />
                            </div>
                        }
                    />
                );
            }

            return (
                <HeaderBar
                    className="LoadingResultsHeader"
                    primaryText={primaryText}
                    secondaryText={
                        <div>
                            <ErrorMessage>{error}</ErrorMessage>
                            <HomeLink />
                        </div>
                    }
                />
            );
        }

        const servicesWord = meta.total_count == 1 ?
            "service"
            : "services";
        const personalisations = [
            Gender,
            Age,
            Location,
        ].filter((component) =>
            this.props.personalisationComponents.includes(component)
        )
        .map((component) => component.headingValue())
        const count = meta.total_count > 20 ? "lots of" : meta.total_count;

        return (
            <HeaderBar
                className="LoadingResultsHeader"
                primaryText={
                    meta.total_count > 0 ?
                        <LogoHeader>
                            I found {count} {servicesWord}{' '}
                            {personalisations.join(" ")}
                        </LogoHeader>
                    : <LogoHeader>
                         Sorry, I couldn't find any results
                         for {title.toLocaleLowerCase()}.
                     </LogoHeader>
                }
                secondaryText={
                    <div>
                        <InfoMessage {...category} />
                        <PersonalisationLink {...location} />
                    </div>
                }
            />
        );
    }

}

export default LoadingResultsHeader;
