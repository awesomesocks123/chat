import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Smartphone, MessageSquare,  LucideShieldQuestion, Phone, Users, ChevronRight, Lock, Settings, MessageCircle, MessageCircleQuestion,} from 'lucide-react';

// Combined Chats Content component
const ChatsContent = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Scroll to the section based on URL hash if present
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    }
  }, []);
  
  return (
    <div className="card bg-base-100 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="card-body">
        {/* Starting a Chat Section */}
        <section id="starting-chat" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Starting a Chat</h2>
          
          <div className="prose max-w-none">
            <p className="mb-4">
              Chamo offers multiple ways to start conversations with other users. Here's how you can begin chatting.
            </p>
            
            <h3 className="text-xl font-bold mb-4">Random Chat Matching</h3>
            
            <p className="mb-4">
              The easiest way to start chatting is through our random matching system:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click on the "Random Chat" button in the sidebar</li>
              <li>Wait a moment while we match you with another user</li>
              <li>Once matched, you can start sending messages right away</li>
            </ol>
            
            <div className="bg-base-200 p-4 rounded-lg my-4">
              <p className="text-sm"><strong>Note:</strong> Random chat matches are based on user availability. If you're matched with someone you've already chatted with, it means there are currently no new users available for matching.</p>
            </div>
            
            <h3 className="text-xl font-bold my-4">Resuming Existing Chats</h3>
            
            <p>
              To continue a previous conversation:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>Find the user in your chat list in the sidebar</li>
              <li>Click on their name to open the conversation</li>
              <li>You can now continue your conversation where you left off</li>
            </ol>
          </div>
        </section>
        
        {/* Managing Conversations Section */}
        <section id="managing-conversations" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Managing Conversations</h2>
          
          <div className="prose max-w-none">
            <p className="mb-4">
              Chamo provides several tools to help you manage your conversations effectively.
            </p>
            
            <h3 className="text-xl font-bold mb-4">Organizing Your Chats</h3>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Swipe left on a chat to archive it</li>
              <li>Pin important conversations to the top of your list</li>
              <li>Use the search function to find specific messages or chats</li>
              <li>Mark conversations as read/unread</li>
            </ul>
            
            <h3 className="text-xl font-bold my-4">Chat Settings</h3>
            
            <p className="mb-4">
              Each chat has its own settings that you can customize:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Notification preferences</li>
              <li>Chat color and theme</li>
              <li>Media auto-download settings</li>
              <li>Privacy options</li>
            </ul>
          </div>
        </section>
        
        {/* Blocking Users Section */}
        <section id="blocking-users" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Blocking Users</h2>
          
          <div className="prose max-w-none">
            <p className="mb-4">
              If you encounter someone who is behaving inappropriately, you can block them to prevent further communication.
            </p>
            
            <h3 className="text-xl font-bold mb-4">How to Block a User</h3>
            
            <p className="mb-4">
              There are several ways to block a user in Chamo:
            </p>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <p><strong>From a chat</strong> - Open the chat, tap on the user's name at the top to view their profile, then select "Block User"</p>
              </li>
              <li>
                <p><strong>From your contacts</strong> - Find the user in your contacts list, tap on their name, and select "Block User"</p>
              </li>
              <li>
                <p><strong>From settings</strong> - Go to Settings {'>'} Privacy {'>'} Blocked Users {'>'} Add, then select the user you want to block</p>
              </li>
            </ol>
            
            <h3 className="text-xl font-bold my-4">What Happens When You Block Someone</h3>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>They won't be able to send you messages</li>
              <li>They won't see when you're online</li>
              <li>They won't be able to see your profile updates</li>
              <li>Existing chats will be archived</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

// Coming Soon component for features that are not yet implemented
const ComingSoon = ({ title }) => (
  <div className="card bg-base-100 h-[calc(100vh-8rem)] overflow-y-auto">
    <div className="card-body">
      <h2 className="card-title text-2xl mb-6">{title}</h2>
      
      <div className="prose max-w-none">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
          <p className="text-center max-w-md mb-6">
            We're working hard to bring you this feature. Check back soon for updates on {title.toLowerCase()}.  
          </p>
          <div className="badge badge-primary badge-outline p-3">Under Development</div>
        </div>
      </div>
    </div>
  </div>
);

// Individual FAQ components
const FAQ = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Scroll to the section based on URL hash if present
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    }
  }, []);
  
  return (
    <div className="card bg-base-100 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-8">
          <section id="create-account" className="prose max-w-none">
            <h3 className="text-xl font-bold mb-3">How do I create an account on the chat app?</h3>
            <p className="mb-6">To create an account, simply download the app from the app store, open it, and follow the on-screen instructions to sign up. You'll need to provide a valid email address or phone number and create a secure password.</p>
          </section>
          
          <section id="multiple-devices" className="prose max-w-none">
            <h3 className="text-xl font-bold mb-3">Can I use the chat app on multiple devices simultaneously?</h3>
            <p className="mb-6">Yes, the chat app supports multi-device functionality. Once logged in, you can access your chats and conversations seamlessly across different devices, such as smartphones, tablets, and computers.</p>
          </section>
          
          <section id="encryption" className="prose max-w-none">
            <h3 className="text-xl font-bold mb-3">Is end-to-end encryption supported for private conversations?</h3>
            <p className="mb-6">Absolutely. Your private conversations are protected with end-to-end encryption, ensuring that only you and the intended recipient can access the messages. This enhances the security and privacy of your communications.</p>
          </section>
          
          <section id="customize-profile" className="prose max-w-none">
            <h3 className="text-xl font-bold mb-3">How do I customize my profile on the chat app?</h3>
            <p className="mb-6">To customize your profile, go to the settings menu and select the 'Profile' option. Here, you can upload a profile picture, update your status, and add a personal bio. Make your profile uniquely yours!</p>
          </section>
          
          <section id="forgot-password" className="prose max-w-none">
            <h3 className="text-xl font-bold mb-3">What should I do if I forgot my password?</h3>
            <p className="mb-6">If you've forgotten your password, tap on the 'Forgot Password' link on the login screen. You'll be prompted to enter your email address or phone number, and we'll send you instructions on how to reset your password securely.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

// Individual FAQ section components for direct navigation
const FAQCreateAccount = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('create-account');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <FAQ />;
};

const FAQMultipleDevices = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('multiple-devices');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <FAQ />;
};

const FAQEncryption = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('encryption');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <FAQ />;
};

const FAQCustomizeProfile = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('customize-profile');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <FAQ />;
};

const FAQForgotPassword = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('forgot-password');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <FAQ />;
};

// Privacy Policy component
const PrivacyPolicy = ({ initialSection = 'overview' }) => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Scroll to the initial section when component mounts
  useEffect(() => {
    if (initialSection) {
      scrollToSection(initialSection);
    }
  }, [initialSection]);
  
  return (
    <div className="card bg-base-100 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6">Privacy Policy</h2>
        
        <div className="flex justify-end mb-4">
          <button className="btn btn-sm btn-outline gap-2">
            <span>Copy link</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Main content */}
        <div className="prose max-w-none">
            <div className="space-y-8">
              <p className="mb-2 text-base-content/80">This is our privacy which outlines what information we collect, why we collect it, and how we use it to give you the best experience on our app.</p>
              <p className="text-sm italic mb-6 text-base-content/70">Effective March 9, 2024</p>
              <p className="text-sm italic mb-8 text-base-content/70">Last Updated: March 9, 2024</p>
              
              <section id="overview">
                <h3 className="text-xl font-bold mb-2">Overview</h3>
                <p className="text-base-content/80 mb-4">This is our privacy which outlines what information we collect, why we collect it, and how we use it to give you the best experience on our app.</p>
              </section>
              
              <section id="collect">
                <h3 className="text-xl font-bold mb-2">What We Collect</h3>
                <p className="text-base-content/80 mb-4">We collect information, including info you choose to share with us and info while you're using our app.</p>
                
                <div className="space-y-4 ml-4">
                  <section id="collect---info-shared">
                    <h4 className="text-lg font-medium mb-2">Info You Share</h4>
                    <p className="text-base-content/80">
                      We collect the information that you share with us when creating an account. Account creation includes providing us with your first, last name, and email address.
                      When you've created an account, you're able to customize your profile by adding a profile picture, biography, and custom tags.
                      We record this information that you share with us, including your profile biography, any profile pictures uploaded, and any tags you've added to your profile.
                    </p>
                  </section>
                  
                  <section id="collect---info-app">
                    <h4 className="text-lg font-medium mb-2">Info When Using the App</h4>
                    <p className="text-base-content/80">
                      We also collect information needed to use the app and its features. Chamo is primarily a messaging app, so of course, we collect and store information on the 
                      chats you've joined, including the user who you've joined the chat with. When you create a new chat with a user, we collect information about that chat, 
                      including the user you're paired with. We collect information about your interactions in the chatroom, including its messages and the timestamps of those 
                      messages.
                    </p>
                    <p className="text-base-content/80 mt-4">
                      When using Chamo's messaging feature, you have the ability to send friend requests to users you've chatted with. We collect information on the friends 
                      you've added from the chats you created, as well as the list of your friends. We collect information about your browsing session, including the timestamp of 
                      your current login session.
                    </p>
                  </section>
                </div>
              </section>
              
              <section id="use">
                <h3 className="text-xl font-bold mb-2">How We Use It</h3>
                <p className="text-base-content/80 mb-4">We collect information about you for many reasons, including maintaining the operability of the app, maintaining its safety and security, and communicating with you.</p>
                
                <div className="space-y-4 ml-4">
                  <section id="use---operate">
                    <h4 className="text-lg font-medium mb-2">To operate the app</h4>
                    <p className="text-base-content/80">
                      We collect information in order to provide you with our services and allow you to use our apps features. For example, Chamo's messaging capability is one of its core features. For this feature to function, we collect and record messages and their timestamps so that you can chat with fellow users and read your chat history.
                    </p>
                  </section>
                  
                  <section id="use---safety">
                    <h4 className="text-lg font-medium mb-2">To maintain safety and security</h4>
                    <p className="text-base-content/80">
                      We also collect information to maintain the safety and security of your account and our app. For example, during the account creation process, ensuring the legitimacy of an email address is important! We collect your email address so that we can verify that the email entered is usable, which is important for managing your account as well as communicating with you!
                    </p>
                    <p className="text-base-content/80 mt-4">
                      To ensure our users abide by our terms of service, we collect information about your messages to ensure it abides by our safety filter. 
                      We collect information about your browsing session so that your sessions time out when you've been inactive for too long.
                    </p>
                  </section>
                  
                  <section id="use---communicate">
                    <h4 className="text-lg font-medium mb-2">To communicate with you</h4>
                    <p className="text-base-content/80">
                      We also use the email you provided us with to communicate you regarding any help or customer service requests. This includes things like responding to any help requests or reports.
                    </p>
                  </section>
                </div>
              </section>
              
              <section id="disclose">
                <h3 className="text-xl font-bold mb-2">How we disclose your information</h3>
                <p className="text-base-content/80 mb-4">We don't disclose your information.</p>
                
                <div className="space-y-4 ml-4">
                  <section id="disclose---does-not">
                    <h4 className="text-lg font-medium mb-2">Chamo doesn't.</h4>
                    <p className="text-base-content/80">
                      Only our development team has access to your information strictly for development purposes. Chamo doesn't sell or disclose your information to third-parties.
                    </p>
                  </section>
                </div>
              </section>
            </div>
        </div>
      </div>
    </div>
  );
};



// Combined Get Started Content component
const GetStartedContent = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Scroll to the section based on URL hash if present
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    }
  }, []);
  
  return (
    <div className="card bg-base-100 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="card-body">
        <div className="flex justify-end mb-4">
          <button className="btn btn-sm btn-outline gap-2">
            <span>Copy link</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="tabs tabs-boxed mb-6">
          <a className="tab tab-active">All Platforms</a>
          <a className="tab">Android</a>
          <a className="tab">iOS</a>
        </div>
        
        {/* Introduction Section */}
        <section id="introduction" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Introduction to Chamo</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Welcome to Chamo. With Chamo, you'll get fast, simple, and secure messaging and
              calling available on devices all over the world. To get started, download Chamo for free from
              the App Store or Google Play Store.
            </p>
            
            <p className="mb-4">
              Scan the QR code with your phone's camera and tap the link to be taken to the download page on the Play Store.
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-base-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2">
                    <Smartphone className="w-12 h-12 mx-auto text-primary" />
                  </div>
                  <p className="text-sm">QR Code Placeholder</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-4">What is Chamo?</h3>
            <p className="mb-4">
              Chamo is a modern messaging platform designed for simplicity and security. Our mission is to provide a seamless communication experience while respecting your privacy.
            </p>
            
            <h3 className="text-xl font-bold mb-4">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encrypted messaging</li>
              <li>Voice and video calls</li>
              <li>Group chats and channels</li>
              <li>File sharing and media</li>
              <li>Cross-platform availability</li>
            </ul>
          </div>
        </section>
        
        {/* Creating an Account Section */}
        <section id="creating-account" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Creating an Account</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Getting started with Chamo is easy. Follow these simple steps to create your account and begin chatting.
            </p>
            
            <h3 className="text-xl font-bold mb-4">Download the App</h3>
            <p className="mb-4">
              First, download Chamo from your device's app store:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>For iOS devices: Download from the App Store</li>
              <li>For Android devices: Download from the Google Play Store</li>
              <li>For desktop: Visit our website and download the desktop version</li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4">Sign Up Process</h3>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p><strong>Open the app</strong> - Launch Chamo on your device</p>
              </li>
              <li>
                <p><strong>Choose "Create Account"</strong> - Tap on the sign-up option</p>
              </li>
              <li>
                <p><strong>Enter your phone number</strong> - This will be used for verification</p>
              </li>
              <li>
                <p><strong>Verify your number</strong> - Enter the verification code sent to you</p>
              </li>
              <li>
                <p><strong>Set up your profile</strong> - Add your name, profile picture, and optional bio</p>
              </li>
              <li>
                <p><strong>Set security preferences</strong> - Configure privacy and security settings</p>
              </li>
            </ol>
            
            <div className="bg-base-200 p-4 rounded-lg my-6">
              <p className="text-sm"><strong>Note:</strong> Your phone number is only used for account verification and won't be visible to other users unless you choose to share it.</p>
            </div>
          </div>
        </section>
        
        {/* Basic Navigation Section */}
        <section id="basic-navigation" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Basic Navigation</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Once you've created your account, let's explore the basic navigation of the Chamo app.
            </p>
            
            <h3 className="text-xl font-bold mb-4">Main Interface</h3>
            <p className="mb-4">
              The Chamo interface is designed to be intuitive and easy to navigate. Here are the main elements:
            </p>
            
            <ul className="list-disc pl-6 space-y-4 mb-6">
              <li>
                <p><strong>Chats Tab</strong> - Access all your conversations, including one-on-one and group chats</p>
              </li>
              <li>
                <p><strong>Contacts Tab</strong> - View and manage your contacts list</p>
              </li>
              <li>
                <p><strong>Discover Tab</strong> - Find new users, groups, and channels to join</p>
              </li>
              <li>
                <p><strong>Settings</strong> - Configure your profile, privacy, and app preferences</p>
              </li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4">Navigating Conversations</h3>
            <p className="mb-4">
              Within a conversation, you'll find these features:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Message input field at the bottom</li>
              <li>Attachment button for sharing media and files</li>
              <li>Voice message recording option</li>
              <li>Emoji and sticker selector</li>
              <li>Video and voice call buttons in the header</li>
            </ul>
            
            <h3 className="text-xl font-bold my-4">Customizing Your Experience</h3>
            <p className="mb-4">
              Chamo offers various customization options to make the app your own:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Theme selection (light/dark mode)</li>
              <li>Chat wallpaper customization</li>
              <li>Font size adjustment</li>
              <li>Notification settings per conversation</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

// Get Started component (default view) - now just passes through to combined content
const GetStarted = () => <GetStartedContent />;

// Individual section components now just pass through to the combined content with appropriate section
const Introduction = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('introduction');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <GetStartedContent />;
};

const CreatingAccount = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('creating-account');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <GetStartedContent />;
};

const BasicNavigation = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('basic-navigation');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <GetStartedContent />;
};

// Individual Chats section components now just pass through to the combined content
const StartingChat = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('starting-chat');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <ChatsContent />;
};

const ManagingConversations = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('managing-conversations');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <ChatsContent />;
};

const BlockingUsers = () => {
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    setTimeout(() => {
      const element = document.getElementById('blocking-users');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);
  return <ChatsContent />;
};



export const HelpPage = () => {
  const [activeTopic, setActiveTopic] = useState('get-started');
  
  const handleTopicChange = (topic, sectionId = null) => {
    setActiveTopic(topic);
    
    // If a specific section ID is provided, scroll to it after a short delay
    // to ensure the component has mounted
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  
  return (
    <div className="min-h-screen bg-base-100 pt-24">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-6rem)]">
          {/* Left sidebar - fixed */}
          <div className="w-full md:w-1/4 bg-base-100 md:overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-content" />
              </div>
              <h1 className="text-xl font-bold">Help Center</h1>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-base-content/50" />
              </div>
              <input 
                type="text" 
                placeholder="Search help articles..." 
                className="input input-bordered w-full pl-10"
              />
            </div>
            
            <div className="space-y-1">
              {/* Get Started section */}
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" defaultChecked /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-medium">Get Started</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'introduction' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('introduction')}
                    >Introduction</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'creating-account' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('creating-account')}
                    >Creating an Account</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'basic-navigation' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('basic-navigation')}
                    >Basic Navigation</li>
                  </ul>
                </div>
              </div>
              
              {/* Chats section */}
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" defaultChecked /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Chats</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'starting-chat' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('starting-chat')}
                    >Starting a Chat</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'managing-conversations' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('managing-conversations')}
                    >Managing Conversations</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'blocking-users' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('blocking-users')}
                    >Blocking Users</li>
                  </ul>
                </div>
              </div>
              
              {/* Voice and Video Calls */}
              <div className="bg-base-100 border-b border-base-300 cursor-pointer" onClick={() => setActiveTopic('voice-video-calls')}>
                <div className="flex items-center justify-between py-3 px-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="font-medium">Voice and Video Calls</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              
              {/* Communites & Spaces */}
              <div className="bg-base-100 border-b border-base-300 cursor-pointer" onClick={() => setActiveTopic('communities-spaces')}>
                <div className="flex items-center justify-between py-3 px-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">Communities & Spaces</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Safety & Privacy section */}
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" defaultChecked /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="font-medium">Safety & Privacy</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'privacy-overview' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('privacy-overview')}
                    >Overview</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'what-we-collect' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('what-we-collect')}
                    >What We Collect</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'how-we-use-it' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('how-we-use-it')}
                    >How We Use It</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'how-we-disclose' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('how-we-disclose')}
                    >How we disclose your information</li>
                  </ul>
                </div>
              </div>
              
              {/* FAQ section */}
              <div className="collapse collapse-arrow bg-base-100 border-b border-base-300">
                <input type="checkbox" defaultChecked /> 
                <div className="collapse-title flex items-center gap-3 py-3">
                  <LucideShieldQuestion className="w-5 h-5 text-primary" />
                  <span className="font-medium">FAQ</span>
                </div>
                <div className="collapse-content pl-12">
                  <ul className="space-y-2">
                    <li 
                      className={`hover:text-primary cursor-pointer ${activeTopic === 'faq' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq')}
                    >All FAQs</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ml-4 text-sm ${activeTopic === 'faq-create-account' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq-create-account')}
                    >Creating an Account</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ml-4 text-sm ${activeTopic === 'faq-multiple-devices' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq-multiple-devices')}
                    >Multiple Devices</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ml-4 text-sm ${activeTopic === 'faq-encryption' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq-encryption')}
                    >Encryption</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ml-4 text-sm ${activeTopic === 'faq-customize-profile' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq-customize-profile')}
                    >Customizing Profile</li>
                    <li 
                      className={`hover:text-primary cursor-pointer ml-4 text-sm ${activeTopic === 'faq-forgot-password' ? 'text-primary font-medium' : ''}`}
                      onClick={() => handleTopicChange('faq-forgot-password')}
                    >Forgot Password</li>
                  </ul>
                </div>
              </div>
              
              
            </div>
          </div>
          
          {/* Main content - scrollable */}
          <div className="w-full md:w-3/4 bg-base-100 md:overflow-y-auto">
            {activeTopic === 'get-started' && <GetStarted />}
            {activeTopic === 'introduction' && <Introduction />}
            {activeTopic === 'creating-account' && <CreatingAccount />}
            {activeTopic === 'basic-navigation' && <BasicNavigation />}
            {activeTopic === 'starting-chat' && <StartingChat />}
            {activeTopic === 'managing-conversations' && <ManagingConversations />}
            {activeTopic === 'blocking-users' && <BlockingUsers />}
            {activeTopic === 'voice-video-calls' && <ComingSoon title="Voice and Video Calls" />}
            {activeTopic === 'communities-spaces' && <ComingSoon title="Communities & Spaces" />}
            
            {/* Safety & Privacy sections */}
            {activeTopic === 'privacy-overview' && <PrivacyPolicy initialSection="overview" />}
            {activeTopic === 'what-we-collect' && <PrivacyPolicy initialSection="collect" />}
            {activeTopic === 'how-we-use-it' && <PrivacyPolicy initialSection="use" />}
            {activeTopic === 'how-we-disclose' && <PrivacyPolicy initialSection="disclose" />}
            
            {activeTopic === 'settings-preferences' && <ComingSoon title="Settings and Preferences" />}
            {activeTopic === 'business-connect' && <ComingSoon title="Connect with Businesses" />}
            {activeTopic === 'payments' && <ComingSoon title="Payments" />}
            {activeTopic === 'faq' && <FAQ />}
            {activeTopic === 'faq-create-account' && <FAQCreateAccount />}
            {activeTopic === 'faq-multiple-devices' && <FAQMultipleDevices />}
            {activeTopic === 'faq-encryption' && <FAQEncryption />}
            {activeTopic === 'faq-customize-profile' && <FAQCustomizeProfile />}
            {activeTopic === 'faq-forgot-password' && <FAQForgotPassword />}
          </div>
        </div>
      </div>
    </div>
  );
};
