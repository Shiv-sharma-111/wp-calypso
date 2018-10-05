/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isSupported } from 'u2f-api';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import SecurityU2fKeyAdd from './add';
import SecurityU2fKeyList from './list';
import { recordGoogleEvent } from 'state/analytics/actions';
import wpcom from 'lib/wp';

class SecurityU2fKey extends React.Component {
	static initialState = Object.freeze( {
		addingKey: false,
		u2fChallenge: {},
		u2fKeys: [],
	} );

	state = this.constructor.initialState;

	componentDidMount = () => {
		this.getChallenge();
	};

	getClickHandler = ( action, callback ) => {
		return event => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	addKeyStart = event => {
		event.preventDefault();
		this.setState( { addingKey: true } );
	};

	addKeyRegister = keyData => {
		console.log( 'Register key: ', keyData ); //eslint-disable-line
		wpcom.req.post(
			'/me/two-step/security-key/registration_challenge',
			keyData,
			this.getKeysFromServer
		);
	};

	addKeyCancel = () => {
		this.setState( { addingKey: false } );
	};

	keysFromServer = data => {
		this.setState( { u2fKeys: data } );
	};

	getChallenge = () => {
		wpcom.req.get( '/me/two-step/security-key/registration_challenge', {}, this.setChallenge );
	};

	setChallenge = ( error, data ) => {
		this.setState( { u2fChallenge: data.regRequest } );
	};

	getKeysFromServer = () => {
		wpcom.req.get( '/me/two-step/security-key/registration_challenge', {}, this.keysFromServer );
	};

	render() {
		const { translate } = this.props;
		const { addingKey } = this.state;
		const u2fKeys = [];
		return (
			<Fragment>
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! addingKey && (
						//! u2fKeys.length &&
						<Button
							compact
							onClick={ this.getClickHandler( 'Register New Key Button', this.addKeyStart ) }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon="plus-small" size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ translate( 'Register Key' ) }
						</Button>
					) }
				</SectionHeader>
				{ addingKey &&
					this.state.u2fChallenge && (
						<SecurityU2fKeyAdd
							onRegister={ this.addKeyRegister }
							onCancel={ this.addKeyCancel }
							registerRequests={ this.state.u2fChallenge }
						/>
					) }
				{ ! addingKey &&
					! u2fKeys.length && (
						<Card>
							<p>Use a Universal 2nd Factor security key to sign in.</p>
							{ ! isSupported() && (
								<p>
									Looks like you browser doesn't support the FIDO U2F standard yet. Read more about
									the requirements for adding a key to your account.
								</p>
							) }
						</Card>
					) }
				{ ! addingKey &&
					!! u2fKeys.length && <SecurityU2fKeyList securityKeys={ this.props.u2fKeys } /> }
			</Fragment>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKey ) );
