/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated by codegen project: GenerateModuleH.js
 */

#include <_generated/NativeModules.h>

namespace facebook {
namespace react {

static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getDraft(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getDraft(rt, args[0].getString(rt));
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_updateDraft(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->updateDraft(rt, args[0].getObject(rt));
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_moveDraft(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->moveDraft(rt, args[0].getString(rt), args[1].getString(rt));
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllDrafts(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getAllDrafts(rt);
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_removeAllDrafts(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->removeAllDrafts(rt);
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllMessages(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getAllMessages(rt);
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllMessagesSync(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getAllMessagesSync(rt);
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_processMessageStoreOperations(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->processMessageStoreOperations(rt, args[0].getObject(rt).getArray(rt));
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_processMessageStoreOperationsSync(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->processMessageStoreOperationsSync(
          rt, args[0].getObject(rt).getArray(rt));
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllThreads(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getAllThreads(rt);
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllThreadsSync(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getAllThreadsSync(rt);
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_processThreadStoreOperations(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->processThreadStoreOperations(rt, args[0].getObject(rt).getArray(rt));
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_processThreadStoreOperationsSync(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->processThreadStoreOperationsSync(
          rt, args[0].getObject(rt).getArray(rt));
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_initializeCryptoAccount(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->initializeCryptoAccount(rt, args[0].getString(rt));
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_getUserPublicKey(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getUserPublicKey(rt);
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_getUserOneTimeKeys(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getUserOneTimeKeys(rt);
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_openSocket(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->openSocket(rt, args[0].getString(rt));
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getCodeVersion(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->getCodeVersion(rt);
}
static jsi::Value __hostFunction_CommCoreModuleSchemaCxxSpecJSI_setNotifyToken(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->setNotifyToken(rt, args[0].getString(rt));
}
static jsi::Value
__hostFunction_CommCoreModuleSchemaCxxSpecJSI_clearNotifyToken(
    jsi::Runtime &rt,
    TurboModule &turboModule,
    const jsi::Value *args,
    size_t count) {
  return static_cast<CommCoreModuleSchemaCxxSpecJSI *>(&turboModule)
      ->clearNotifyToken(rt);
}

CommCoreModuleSchemaCxxSpecJSI::CommCoreModuleSchemaCxxSpecJSI(
    std::shared_ptr<CallInvoker> jsInvoker)
    : TurboModule("CommTurboModule", jsInvoker) {
  methodMap_["getDraft"] =
      MethodMetadata{1, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getDraft};
  methodMap_["updateDraft"] = MethodMetadata{
      1, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_updateDraft};
  methodMap_["moveDraft"] = MethodMetadata{
      2, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_moveDraft};
  methodMap_["getAllDrafts"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllDrafts};
  methodMap_["removeAllDrafts"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_removeAllDrafts};
  methodMap_["getAllMessages"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllMessages};
  methodMap_["getAllMessagesSync"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllMessagesSync};
  methodMap_["processMessageStoreOperations"] = MethodMetadata{
      1,
      __hostFunction_CommCoreModuleSchemaCxxSpecJSI_processMessageStoreOperations};
  methodMap_["processMessageStoreOperationsSync"] = MethodMetadata{
      1,
      __hostFunction_CommCoreModuleSchemaCxxSpecJSI_processMessageStoreOperationsSync};
  methodMap_["getAllThreads"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllThreads};
  methodMap_["getAllThreadsSync"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getAllThreadsSync};
  methodMap_["processThreadStoreOperations"] = MethodMetadata{
      1,
      __hostFunction_CommCoreModuleSchemaCxxSpecJSI_processThreadStoreOperations};
  methodMap_["processThreadStoreOperationsSync"] = MethodMetadata{
      1,
      __hostFunction_CommCoreModuleSchemaCxxSpecJSI_processThreadStoreOperationsSync};
  methodMap_["initializeCryptoAccount"] = MethodMetadata{
      1, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_initializeCryptoAccount};
  methodMap_["getUserPublicKey"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getUserPublicKey};
  methodMap_["getUserOneTimeKeys"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getUserOneTimeKeys};
  methodMap_["openSocket"] = MethodMetadata{
      1, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_openSocket};
  methodMap_["getCodeVersion"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_getCodeVersion};
  methodMap_["setNotifyToken"] = MethodMetadata{
      1, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_setNotifyToken};
  methodMap_["clearNotifyToken"] = MethodMetadata{
      0, __hostFunction_CommCoreModuleSchemaCxxSpecJSI_clearNotifyToken};
}

} // namespace react
} // namespace facebook
