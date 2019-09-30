import Component from '@ember/component';
import { tryInvoke } from '@ember/utils';
/**
	ATTRIBUTES
	a1=a1
	a2=a2
	action1=(action "action1)"
**/
export default Component.extend({
	actions: {
		action1() {
			tryInvoke(this, 'action1');
		},
	}
});
