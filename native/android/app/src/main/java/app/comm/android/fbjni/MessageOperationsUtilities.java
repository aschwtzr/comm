package app.comm.android.fbjni;

public class MessageOperationsUtilities {
  public static native void
  storeNotification(String sqliteFilePath, String rawMessageInfo);
}
