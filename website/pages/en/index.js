/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = (props) => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = (props) => (
      <div className="projectLogo">
        {/* <img src={props.img_src} alt="Project Logo" /> */}
      </div>
    );

    const ProjectTitle = (props) => (
      <h2 className="projectTitle">
        {props.title}
        <small>{props.tagline}</small>
      </h2>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_monitor.svg`} />
        <div className="inner">
          <ProjectTitle tagline={siteConfig.tagline} title={siteConfig.title} />
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const Block = (props) => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Features = () => (
      <Block layout="twoColumn">
        {[
          {
            content: '',
            image: `${baseUrl}img/undraw_react.svg`,
            imageAlign: 'top',
            title: `[About dbt Labs](${docUrl(
              'about_dbt_labs.html',
            )})`,
          },
          {
            content: '',
            image: `${baseUrl}img/undraw_operating_system.svg`,
            imageAlign: 'top',
            title: `[Benefits](${docUrl(
              'benefits.html',
            )})`,
          },
          {
            content: '',
            image: `${baseUrl}img/undraw_react.svg`,
            imageAlign: 'top',
            title: `[Compensation](${docUrl(
              'compensation.html',
            )})`,
          },
          {
            content: '',
            image: `${baseUrl}img/undraw_operating_system.svg`,
            imageAlign: 'top',
            title: `[Mission](${docUrl(
              'mission.html',
            )})`,
          },
          {
            content: '',
            image: `${baseUrl}img/undraw_react.svg`,
            imageAlign: 'top',
            title: `[Values](${docUrl(
              'values.html',
            )})`,
          },
          {
            content: '',
            image: `${baseUrl}img/undraw_operating_system.svg`,
            imageAlign: 'top',
            title: `[Working and Growing Here](${docUrl(
              'working_and_growing_here.html',
            )})`,
          },
        ]}
      </Block>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
        </div>
      </div>
    );
  }
}

module.exports = Index;
