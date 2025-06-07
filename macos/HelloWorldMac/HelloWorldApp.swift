import SwiftUI

@main
struct HelloWorldApp: App {
    var body: some Scene {
        WindowGroup {
            Text("Hello, world!")
                .frame(minWidth: 200, minHeight: 200)
                .padding()
        }
    }
}
