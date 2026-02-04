import {
	Euler,
	MathUtils,
	Quaternion,
	Vector3
} from 'three';

/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

class DeviceOrientationControls {

	constructor( object ) {

		this.object = object;
		this.object.rotation.reorder( 'YXZ' );

		this.enabled = true;

		this.deviceOrientation = {};
		this.screenOrientation = 0;

		this.alphaOffset = 0; // radians

		this.connect();

	}

	onDeviceOrientationChangeEvent( event ) {

		this.deviceOrientation = event;

	}

	onScreenOrientationChangeEvent() {

		this.screenOrientation = window.orientation || 0;

	}

	connect() {

		this.onScreenOrientationChangeEvent(); // run once on load

		// iOS 13+

		if ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {

			this.deviceOrientation = {}; // clear

		}

		window.addEventListener( 'orientationchange', this.onScreenOrientationChangeEvent.bind( this ) );
		window.addEventListener( 'deviceorientation', this.onDeviceOrientationChangeEvent.bind( this ) );

		this.enabled = true;

	}

	disconnect() {

		window.removeEventListener( 'orientationchange', this.onScreenOrientationChangeEvent.bind( this ) );
		window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChangeEvent.bind( this ) );

		this.enabled = false;

	}

	update() {

		if ( this.enabled === false ) return;

		const device = this.deviceOrientation;

		if ( device ) {

			const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) + this.alphaOffset : 0; // Z
			const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'
			const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''
			const orient = this.screenOrientation ? MathUtils.degToRad( this.screenOrientation ) : 0; // O

			setObjectQuaternion( this.object.quaternion, alpha, beta, gamma, orient );

		}

	}

	dispose() {

		this.disconnect();

	}

}

const _zee = new Vector3( 0, 0, 1 );
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

function setObjectQuaternion( quaternion, alpha, beta, gamma, orient ) {

	_euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

	quaternion.setFromEuler( _euler ); // orient the device

	quaternion.multiply( _q1 ); // camera looks out the back of the device, not the top

	quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) ); // adjust for screen orientation

}

export { DeviceOrientationControls };