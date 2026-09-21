/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import java.net.HttpURLConnection;
import java.net.URI;

public class BeaconSmoke {
  public static void main(String[] args) throws Exception {
    HttpURLConnection connection = (HttpURLConnection) URI.create(args[0]).toURL().openConnection();
    connection.setConnectTimeout(5000);
    connection.setReadTimeout(5000);
    try {
      if (connection.getResponseCode() != 200) {
        throw new IllegalStateException("Smoke request failed");
      }
      try (java.io.InputStream body = connection.getInputStream()) {
        while (body.read() != -1) {}
      }
    } finally {
      connection.disconnect();
    }
  }
}
