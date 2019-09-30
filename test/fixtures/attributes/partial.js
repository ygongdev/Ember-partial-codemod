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
	a14=a14
	a15=a15
	a16=a16
	a17=a17
	a18=a18
	a19=a19
	a20=a20
	a21=a21
	a22=a22
	a23=a23
	a24=a24
	a25=a25
	a26=a26
	a27=a27
	a28=a28
	a29=a29
	a30=a30
	action=(action "action)"
	action1=(action "action1)"
	action2=(action "action2)"
	action3=(action "action3)"
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
		action3() {
			tryInvoke(this, 'action3');
		},
	}
});
