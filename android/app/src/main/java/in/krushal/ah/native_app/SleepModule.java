package in.krushal.ah.native_app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SleepModule extends ReactContextBaseJavaModule {
    SleepModule(ReactApplicationContext context) {
      super(context);
    }

    @Override
    public String getName() {
      return "SleepModule";
    }

    @ReactMethod
    public void sleepInMilliSeconds(int millSeconds) {
      try {
        Thread.sleep((long)millSeconds);
      } catch(Exception e) {
        System.out.println("exception in sleep");
      }
    }
}