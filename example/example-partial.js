import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
/**
	ATTRIBUTES
	a1=a1
	a2=a2
	a3=a3
	a4=a4
	a5=a5
	a6=a6
	a7=a7
	a8=a8
	a9=a9
	a10=a10
	a11=a11
	a12=a12
	a13=a13
	action=(action "action)"
	action1=(action "action1)"
	action2=(action "action2)"
**/
export default Component.extend({
	actions: {
		action() {
			tryInvoke(this, 'action');
		},
		action1() {
			tryInvoke(this, 'action1');
		},
		action2() {
			tryInvoke(this, 'action2');
		},
	}
});
