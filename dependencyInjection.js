/**
 * Created by nikita on 09.12.16.
 */
//get arg of the action
function getArgs(func) {
    return (func + '')
        .replace(/[/][/].*$/mg,'')
        .replace(/\s+/g, '').replace(/[/][*][^/*]*[*][/]/g, '')
        .split('){', 1)[0].split(')=>{', 1)[0].replace(/^[^(]*[(]/, '')
        .replace(/=[^,]+/g, '')
        .split(',').filter(Boolean);
}

var My={
    //global injections
    injections:{},

    wrapFunction(name) {
        var root = this;

        return function() {
            return root.get.apply(root, [name].concat(Array.prototype.slice.call(arguments)));
        }
    },
    //registration new injection
    define:function (name, action) {
        var root = this;
        //inner injection
        var injections = {};

        getArgs(action).forEach(function(arg, index) {
            if (!! root.injections[arg])
            //push to inner injection funcs and her arguments
                injections[index] = root.wrapFunction(arg);
        });

        //change global injections together with the inner injections
        root.injections[name] = {
            'action': action,
            'injections': injections
        };
    },

    //run injections
    get:function (name) {

        var action = this.injections[name].action;
        var injections = this.injections[name].injections;
        var args = [];
        //for getFunc arguments
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }

        args = args.splice(1);
        //for to check the changes in some places
        Object.keys(injections).forEach(function(index){
            args.splice(index, 0, injections[index])
        });

        return action.apply(this, args);
    }
};


My.define("test", () => {
    return 3
});

My.define("test2", (test) => {
    return test() *2
});


My.define("test3", (test, test2) => {
    return test() + test2()
});


var res = My.get("test");
console.log(res);
res = My.get("test2");
console.log(res);
res = My.get("test3",'test2');
console.log(res);
