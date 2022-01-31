#include "GRPCStreamHostObject.h"

using namespace facebook;

GRPCStreamHostObject::GRPCStreamHostObject(
    jsi::Runtime &rt,
    std::shared_ptr<react::CallInvoker> jsInvoker)
    : readyState{0},
      onopen{},
      onmessage{},
      onclose{},
      send{jsi::Function::createFromHostFunction(
          rt,
          jsi::PropNameID::forUtf8(rt, "send"),
          0,
          [](jsi::Runtime &rt,
             const jsi::Value &thisVal,
             const jsi::Value *args,
             size_t count) {
            return jsi::String::createFromUtf8(
                rt, std::string{"GRPCStream.send: unimplemented"});
          })},
      close{jsi::Function::createFromHostFunction(
          rt,
          jsi::PropNameID::forUtf8(rt, "close"),
          0,
          [](jsi::Runtime &rt,
             const jsi::Value &thisVal,
             const jsi::Value *args,
             size_t count) {
            return jsi::String::createFromUtf8(
                rt, std::string{"GRPCStream.close: unimplemented"});
          })} {
  this->jsInvoker = jsInvoker;
}

std::vector<jsi::PropNameID>
GRPCStreamHostObject::getPropertyNames(jsi::Runtime &rt) {
  std::vector<jsi::PropNameID> names;
  names.reserve(6);
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"readyState"}));
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"onopen"}));
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"onmessage"}));
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"onclose"}));
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"close"}));
  names.push_back(jsi::PropNameID::forUtf8(rt, std::string{"send"}));
  return names;
}

jsi::Value
GRPCStreamHostObject::get(jsi::Runtime &runtime, const jsi::PropNameID &name) {
  auto propName = name.utf8(runtime);

  if (propName == "readyState") {
    return jsi::Value(this->readyState);
  }

  if (propName == "send") {
    return this->send.asObject(runtime).asFunction(runtime);
  }

  if (propName == "close") {
    return this->close.asObject(runtime).asFunction(runtime);
  }

  if (propName == "onopen") {
    return this->onopen.isNull()
        ? jsi::Value::null()
        : this->onopen.asObject(runtime).asFunction(runtime);
  }

  if (propName == "onmessage") {
    return this->onmessage.isNull()
        ? jsi::Value::null()
        : this->onmessage.asObject(runtime).asFunction(runtime);
  }

  if (propName == "onclose") {
    return this->onclose.isNull()
        ? jsi::Value::null()
        : this->onclose.asObject(runtime).asFunction(runtime);
  }

  return jsi::String::createFromUtf8(runtime, std::string{"unimplemented"});
}

void GRPCStreamHostObject::set(
    jsi::Runtime &runtime,
    const jsi::PropNameID &name,
    const jsi::Value &value) {
  auto propName = name.utf8(runtime);

  if (propName == "readyState" && value.isNumber()) {
    this->readyState = static_cast<int>(value.asNumber());
  } else if (
      propName == "onopen" && value.isObject() &&
      value.asObject(runtime).isFunction(runtime)) {
    this->onopen = value.asObject(runtime).asFunction(runtime);
  } else if (
      propName == "onmessage" && value.isObject() &&
      value.asObject(runtime).isFunction(runtime)) {
    this->onmessage = value.asObject(runtime).asFunction(runtime);

    auto jsFunction = value.asObject(runtime).asFunction(runtime);
    auto onReadDoneCallback = [this, &runtime, &jsFunction](std::string data) {
      this->jsInvoker->invokeAsync([this, &runtime, &jsFunction, data]() {
        auto msgObject = jsi::Object(runtime);
        msgObject.setProperty(
            runtime, "data", jsi::String::createFromUtf8(runtime, data));
        jsFunction.call(runtime, msgObject, 1);
      });
    };

  } else if (
      propName == "onclose" && value.isObject() &&
      value.asObject(runtime).isFunction(runtime)) {
    this->onclose = value.asObject(runtime).asFunction(runtime);
  }
}
